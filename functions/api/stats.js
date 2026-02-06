export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();

        if (!env.DB) {
            return new Response(JSON.stringify({ error: "Database binding 'DB' not found" }), { status: 500 });
        }

        // Save to game_sessions
        await env.DB.prepare(
            `INSERT INTO game_sessions (
                session_id, pm_party, coalition, coalition_seats,
                selected_policies, policy_count, cabinet,
                chat_questions, chat_count,
                score_total, score_coalition, score_diversity, score_cabinet, score_engagement, grade
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
            .bind(
                body.session_id,
                body.pm_party,
                JSON.stringify(body.coalition),
                body.coalition_seats,
                JSON.stringify(body.selected_policies),
                body.policy_count,
                JSON.stringify(body.cabinet),
                JSON.stringify(body.chat_questions || []),
                body.chat_count || 0,
                body.score_total,
                body.score_coalition,
                body.score_diversity,
                body.score_cabinet,
                body.score_engagement,
                body.grade
            )
            .run();

        // Also save to legacy table for backward compat
        try {
            await env.DB.prepare(
                "INSERT INTO simulation_results (coalition, cabinet, selected_policies) VALUES (?, ?, ?)"
            )
                .bind(JSON.stringify(body.coalition), JSON.stringify(body.cabinet), JSON.stringify(body.selected_policies))
                .run();
        } catch (_) { /* legacy table may not exist */ }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function onRequestGet({ env }) {
    try {
        if (!env.DB) {
            return new Response(JSON.stringify({
                total_games: 0,
                pm_distribution: {},
                avg_score: 0,
                grade_distribution: {},
                message: "DB not connected"
            }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // Total games
        const totalResult = await env.DB.prepare(
            "SELECT COUNT(*) as total FROM game_sessions"
        ).first();

        // PM party distribution
        const pmDist = await env.DB.prepare(
            "SELECT pm_party, COUNT(*) as count FROM game_sessions GROUP BY pm_party ORDER BY count DESC"
        ).all();

        // Average scores
        const avgScores = await env.DB.prepare(
            `SELECT
                ROUND(AVG(score_total), 1) as avg_total,
                ROUND(AVG(score_coalition), 1) as avg_coalition,
                ROUND(AVG(score_diversity), 1) as avg_diversity,
                ROUND(AVG(score_cabinet), 1) as avg_cabinet,
                ROUND(AVG(score_engagement), 1) as avg_engagement
            FROM game_sessions WHERE score_total IS NOT NULL`
        ).first();

        // Grade distribution
        const gradeDist = await env.DB.prepare(
            "SELECT grade, COUNT(*) as count FROM game_sessions WHERE grade IS NOT NULL GROUP BY grade ORDER BY grade"
        ).all();

        // Recent sessions (limited)
        const recentSessions = await env.DB.prepare(
            "SELECT pm_party, coalition, selected_policies, score_total, grade, created_at FROM game_sessions ORDER BY created_at DESC LIMIT 500"
        ).all();

        const pmDistribution = {};
        if (pmDist.results) {
            pmDist.results.forEach(r => { pmDistribution[r.pm_party] = r.count; });
        }

        const gradeDistribution = {};
        if (gradeDist.results) {
            gradeDist.results.forEach(r => { gradeDistribution[r.grade] = r.count; });
        }

        return new Response(JSON.stringify({
            total_games: totalResult?.total || 0,
            pm_distribution: pmDistribution,
            avg_score: avgScores?.avg_total || 0,
            avg_scores: avgScores || {},
            grade_distribution: gradeDistribution,
            recent_sessions: recentSessions?.results || [],
        }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
