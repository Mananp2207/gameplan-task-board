type ToastProps = {
  message: string;
  type: "success" | "error";
};

export default function Toast({
  message,
  type,
}: ToastProps) {
  return (
    <div
      className={`fixed right-6 top-6 z-[9999] rounded-xl px-5 py-4 shadow-xl transition-all duration-300 ${
        type === "success"
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">
          {type === "success" ? "✅" : "❌"}
        </span>

        <span className="font-semibold">
          {message}
        </span>
      </div>
    </div>
  );
}