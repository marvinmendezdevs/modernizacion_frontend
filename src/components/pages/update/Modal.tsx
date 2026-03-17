import { Link } from "react-router";

type ModalProps = {
  open: boolean;
  onClose: () => void;
};

function Modal({ open, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Selecciona un formulario
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 p-4">
          <Link
            to="/dashboard/accesos/form"
            onClick={onClose}
            className="cursor-pointer block rounded-lg border border-gray-200 p-3 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
          >
            Accesos
          </Link>

          <Link
            to="/dashboard/gestion-escolar/form"
            onClick={onClose}
            className="cursor-pointer block rounded-lg border border-gray-200 p-3 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
          >
            Gestión escolar
          </Link>

          <Link
            to="/dashboard/secciones/form"
            onClick={onClose}
            className="cursor-pointer block rounded-lg border border-gray-200 p-3 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
          >
            Secciones
          </Link>
        </div>

        <div className="flex justify-end border-t border-gray-200 p-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;