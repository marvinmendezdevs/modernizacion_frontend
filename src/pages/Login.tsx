import { login } from "@/services/auth.services";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, GraduationCap, Lock, Mail } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { LoginResponseType, LoginType } from "@/types/auth.types";
import type { AxiosError } from "axios";
import type { ErrorResponseApiType } from "@/types/index.types";
import { useState } from "react";
import SpinnerUIComponent from "@/components/ui/SpinnerUIComponent";
import AlertUIComponent from "@/components/ui/AlertUIComponent";
import { useNavigate } from "react-router";
import Env from "@/utils/index.utils";

type AlertType = {
  activate: boolean
  type: 'success' | 'error'
  msg: string
}

function Login() {
  const appName = Env.VITE_APP_NAME;
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginType>();
  const [alert, setAlert] = useState<AlertType>({
    activate: false,
    type: 'success',
    msg: '',
  });

  // Enviar la peticion al backend
  const mutation = useMutation<LoginResponseType, AxiosError<ErrorResponseApiType>, LoginType>({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem('AUTH_TOKEN', data.token);
      navigate('/');
    },
    onError: (error) => {
      console.log(error)
      if (error.response) {
        setAlert({
          activate: true,
          type: 'error',
          msg: error.response.data.message,
        });
      } else {
        setAlert({
          activate: true,
          type: 'error',
          msg: "Error de conexión...",
        });
      }
    },
  });

  const onSubmit: SubmitHandler<LoginType> = (data) => {
    setAlert({
      activate: false,
      type: 'success',
      msg: '',
    });

    mutation.mutate(data);
  }

  return (
    <div className="h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 font-sans">
      {/* Background Decor - Mesh Gradient Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] mix-blend-multiply animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply"></div>
      </div>

      {/* Main Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-[420px] p-8 md:p-10 relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20 mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {appName}
          </h2>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            Bienvenido al panel de control
          </p>
        </div>

        {mutation.isPending && <SpinnerUIComponent />}
        {alert.activate && <AlertUIComponent type={alert.type} msg={alert.msg} />}

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 ml-1" htmlFor="email">Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="email"
                id="email"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-sm font-medium"
                placeholder="hola@ejemplo.com"
                {...register("email", { required: true })}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs my-1">El correo electrónico es obligatorio</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide" htmlFor="password">Contraseña</label>
              <a href="#" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">¿Olvidaste tu contraseña?</a>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="password"
                id="password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-sm font-medium"
                placeholder="••••••••"
                {...register("password", { required: true })}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs my-1">La contraseña es obligatoria</p>}
          </div>

          <button type="submit" className="group w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer">
            <span>Iniciar Sesión</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};


export default Login