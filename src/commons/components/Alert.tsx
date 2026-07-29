import './alert.css'

export function AppAlert({
  type,
  message,
  show,
}: {
  type: "error" | "success";
  message: string;
  show: boolean;
}) {
  return (
    <div className={`${type}-alert ${show ? "show" : "hide"}`}>
      <span>{message}</span>
    </div>
  );
}