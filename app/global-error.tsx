"use client";

export default function GlobalError({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Something went wrong!</h1>
      <p>{error.message}</p>
    </div>
  );
}
