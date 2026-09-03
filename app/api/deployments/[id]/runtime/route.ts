import { NextResponse } from "next/server";
import { Client } from "pg";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: Params,
) {
  const auth = request.headers.get("authorization");
  const expected = process.env.VELCLAW_DEPLOY_API_TOKEN;

  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await params;

  const body = await request.json().catch(() => ({}));

  const status =
    typeof body.status === "string"
      ? body.status
      : "failed";

  const url =
    typeof body.url === "string"
      ? body.url
      : null;

  const logs =
    typeof body.logs === "string"
      ? body.logs
      : null;

  const error =
    typeof body.error === "string"
      ? body.error
      : null;

  if (!["building", "ready", "failed"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid deployment status" },
      { status: 400 },
    );
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();

    const result = await client.query(
      `
        UPDATE velclaw_deployments
        SET
          status = $1,
          url = COALESCE($2, url),
          logs = COALESCE($3, logs),
          error = $4,
          updated_at = NOW()
        WHERE id = $5
        RETURNING
          id,
          project_name,
          status,
          url,
          error,
          logs
      `,
      [
        status,
        url,
        logs,
        error,
        id,
      ],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Deployment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      deployment: result.rows[0],
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Runtime update failed",
      },
      { status: 500 },
    );
  } finally {
    await client.end().catch(() => {});
  }
}