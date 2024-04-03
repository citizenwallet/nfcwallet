export default function Error({ msg }: { msg: string }) {
  return (
    <div className="max-w-sm mx-auto p-8">
      <h1>Error</h1>
      <p>{msg}</p>
    </div>
  );
}
