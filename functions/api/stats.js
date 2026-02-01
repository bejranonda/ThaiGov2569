export async function onRequestPost({ request, env }) {
    try {
        const { coalition, cabinet, policies } = await request.json();

        if (!env.DB) {
            return new Response(JSON.stringify({ error: "Database binding 'DB' not found" }), { status: 500 });
        }

        // Save result to D1
        const result = await env.DB.prepare(
            "INSERT INTO simulation_results (coalition, cabinet, selected_policies) VALUES (?, ?, ?)"
        )
            .bind(JSON.stringify(coalition), JSON.stringify(cabinet), JSON.stringify(policies))
            .run();

        return new Response(JSON.stringify({ success: true, result }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function onRequestGet({ env }) {
    try {
        if (!env.DB) {
            // Return mock data if DB not ready (for dev)
            return new Response(JSON.stringify({ count: 0, message: "DB not connected" }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // Example stat: Count total simulations
        const { results } = await env.DB.prepare(
            "SELECT COUNT(*) as total FROM simulation_results"
        ).all();

        return new Response(JSON.stringify(results[0]), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
