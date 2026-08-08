import session from "@/generated/demo-session.json";

export async function GET() {
  return Response.json(session);
}
