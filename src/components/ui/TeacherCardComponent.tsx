import type { TeacherType } from "@/types/index.types";

type TeacherCardComponentType = {
  teacher: TeacherType;
};

function TeacherCardComponent({ teacher }: TeacherCardComponentType) {
  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-6 flex flex-col items-center flex-1">
        <img
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${teacher.name}`}
          alt={teacher.name}
          className="w-24 h-24 rounded-full mb-4 border-4 border-indigo-50"
        />
        <h3 className="text-xl font-semibold text-gray-800 mb-1">
          {teacher.name}
        </h3>

        <div className="w-full border-t border-gray-100 pt-4 flex flex-col">
          <a
            href={`mailto:${teacher.email}`}
            className="text-gray-600 hover:text-indigo-600 flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            {teacher.email}
          </a>
        </div>
      </div>
      <div className="bg-gray-50 p-4 flex justify-center">
        <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors">
          Ver Perfil Completo
        </button>
      </div>
    </div>
  );
}

export default TeacherCardComponent;
