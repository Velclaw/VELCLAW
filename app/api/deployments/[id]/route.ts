import { NextResponse } from "next/server";
import { Client } from "pg";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: Params) {
  const token = request.headers.get("x-velclaw-admin-token");
  const expected = process.env.VELCLAW_DEPLOY_API_TOKEN;

  if (!expected || token !== expected) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Deployment id is required" },
      { status: 400 },
    );
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();

    await client.query("BEGIN");

    const currentResult = await client.query(
      `
        SELECT
          id,
          project_name,
          status,
          image
        FROM velclaw_deployments
        WHERE id = $1
        FOR UPDATE
      `,
      [id],
    );

    if (currentResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { error: "Deployment not found" },
        { status: 404 },
      );
    }

    const current = currentResult.rows[0];

    const previousResult = await client.query(
      `
        SELECT
          id,
          project_name,
          status,
          image,
          url,
          logs
        FROM velclaw_deployments
        WHERE project_name = $1
          AND status = 'ready'
          AND id <> $2
          AND image IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 1
        FOR UPDATE
      `,
      [current.project_name, id],
    );

    if (previousResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          error: "No previous ready deployment is available for rollback",
        },
        { status: 409 },
      );
    }

    const previous = previousResult.rows[0];

    await client.query(
      `
        UPDATE velclaw_deployments
        SET
          status = 'queued',
          error = NULL,
          logs = COALESCE(logs, '') ||
            E'\\nRollback requested from deployment ' || $1,
          updated_at = NOW()
        WHERE id = $2
      `,
      [previous.id, id],
    );

    await client.query("COMMIT");

    return NextResponse.json({
      ok: true,
      action: "rollback",
      project_name: current.project_name,
      from_deployment: id,
      target_deployment: previous.id,
      image: previous.image,
      status: "queued",
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Rollback failed",
      },
      { status: 500 },
    );
  } finally {
    await client.end().catch(() => {});
  }
}