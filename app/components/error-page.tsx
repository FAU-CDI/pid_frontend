type ErrorPageProps = {
  status: number;
  title: string;
  message: string;
};

export default function ErrorPage({
  status,
  title,
  message,
}: ErrorPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl font-bold text-red-600">
            {status}
          </div>

          <h1 className="mt-4 text-3xl font-bold">
            {title}
          </h1>

          <p className="mt-3 text-gray-600">
            {message}
          </p>
        </div>
      </main>
    </div>
  );
}