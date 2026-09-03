import { NextResponse } from "next/server";
import { Client } from "pg";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = process.env.VELCLAW_DEPLOY_API_TOKEN;

  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();
    await client.query("BEGIN");

    const result = await client.query(`
      SELECT
        id,
        project_name,
        github_url,
        branch,
        status,
        image
      FROM velclaw_deployments
      WHERE status = 'queued'
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    `);

    if (result.rowCount === 0) {
      await client.query("COMMIT");

      return NextResponse.json({
        deployment: null,
      });
    }

    const deployment = result.rows[0];

    await client.query(
      `
        UPDATE velclaw_deployments
        SET
          status = 'building',
          updated_at = NOW()
        WHERE id = $1
      `,
      [deployment.id],
    );

    await client.query("COMMIT");

    return NextResponse.json({
      deployment,
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to claim deployment",
      },
      { status: 500 },
    );
  } finally {
    await client.end().catch(() => {});
  }
}