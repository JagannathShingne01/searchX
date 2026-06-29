import Image from "next/image";

export default async function Home() {
  const data = await fetch("http://localhost:3001/health").then((res) => res.json());
  console.log("dsts",data);
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-2xl text-zinc-900 dark:text-zinc-50">Hello world</h1>
      <p>{JSON.stringify(data)}</p>
    </div>
  );
}
