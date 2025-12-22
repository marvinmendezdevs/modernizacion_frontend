import { updatePassword } from "@/services/auth.services"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, useWatch, type SubmitHandler } from "react-hook-form"
export type DefaultValuesType = {
    password: string
    password_confirmation: string
}


function UpdatePassword() {

    const defaultValues: DefaultValuesType = {
        password: "",
        password_confirmation: ""
    }

    const {register, control, handleSubmit, formState: { errors }} = useForm({ defaultValues });

    const useQuery = useQueryClient();

    const mutation = useMutation({
        mutationKey: ["update-password"],
        mutationFn: updatePassword,
        onSuccess: () => {
            useQuery.invalidateQueries({
                queryKey: ["user"]
            });
        }
    });

    const password = useWatch({
        control,
        name: "password"
    });

    const onSubmit: SubmitHandler<DefaultValuesType> = (data) => {
        mutation.mutate(data);
    }

    return (
        <div className="h-screen flex flex-col justify-center items-center bg-gray-100">

            <div className="bg-white p-5 w-11/12 max-w-lg">
                <h2 className="text-lg font-black uppercase">Actualizar contraseña</h2>
                <p className="text-gray-600">Para continuar navegando, debes actualizar tu contraseña</p>
                <form className="mt-3 space-y-3" onSubmit={ handleSubmit(onSubmit)} >

                    <div className="grid gap-1">
                        <label className="font-semibold" htmlFor="password">Contraseña</label>
                        <input className="p-2 border border-gray-300 rounded" type="password" placeholder="Digite su contraseña nueva"
                            {...register('password', { required: "La contraseña es obligatoria"})}
                        />
                        {errors.password && <p className="text-red-500">{errors.password.message as string}</p>}
                    </div>

                    <div className="grid gap-1">
                        <label className="font-semibold" htmlFor="password_confirmation">Confirme su contraseña</label>
                        <input className="p-2 border border-gray-300 rounded" type="password" placeholder="Repita su contraseña nueva"
                        {...register("password_confirmation", {
                            required: "Debes confirmar la contraseña",
                            validate: (value) => value === password || "Las contraseñas no coinciden"
                        })}/>
                        {errors.password_confirmation && <p className="text-red-500">{errors.password_confirmation.message as string}</p>}
                    </div>

                    {mutation.isPending ? (
                        <p className="w-full bg-slate-800 text-white p-2 rounded text-center opacity-50">Actualizando contraseña</p>
                    ) : (
                        <button className="w-full bg-slate-800 text-white p-2 rounded">
                            Actualizar contraseña
                        </button>
                    )}
                </form>
            </div>
        </div>
    )
}

export default UpdatePassword