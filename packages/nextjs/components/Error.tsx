export default function Error({ title, msg }: { title?: string; msg: string }) {
  return (
    <div className="max-w-sm mx-auto p-8">
      <h1>{title || "Error"}</h1>
      <p>{msg}</p>
    </div>
  );
}
