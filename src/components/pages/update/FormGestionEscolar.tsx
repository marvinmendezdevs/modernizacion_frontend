import { Link } from "react-router"

function FormGestionEscolar() {
  return (
    <div>
        <div className="flex justify-end items-center mb-3">
            <Link
            to="/dashboard/update"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
            Regresar
            </Link>
        </div>
        <p className="border-l-3 border-green-700 bg-green-50 text-green-700 text-center p-2">¡Próximamente!</p>
    </div>
  )
}

export default FormGestionEscolar
