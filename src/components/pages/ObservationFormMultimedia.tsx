import { updateMultimediaJson } from "@/services/tutorship.services";
import type { MultimediaType, ResponseSectionSchema } from "@/types/intruments.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";

type ObservationFormMultimediaType = {
    creatingMultimedia: number | null
    currentUtilitiesLink?: ResponseSectionSchema['utilitiesLink']
}

function ObservationFormMultimedia({ creatingMultimedia, currentUtilitiesLink }: ObservationFormMultimediaType) {
    const defaultValues = {
        video: currentUtilitiesLink?.video || '',
        transcription: currentUtilitiesLink?.transcription || ''
    }

    const { register, handleSubmit, formState: { errors } } = useForm<MultimediaType>({ defaultValues });
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: updateMultimediaJson,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['observations-teacher'] });
        }
    });

    const onSubmit: SubmitHandler<MultimediaType> = (data) => {

        mutation.mutate(data);
    }

    return (
        <form className="mt-3 space-y-2" onSubmit={handleSubmit(onSubmit)}>
            <input
                type="hidden"
                id="id"
                value={creatingMultimedia ?? ''}
                {...register('id', { required: true })}
            />

            <div className="grid gap-1">
                <label htmlFor="video">Grabación del vídeo</label>
                <input
                    className="p-2 border border-gray-200 rounded"
                    type="url"
                    id="video"
                    placeholder="htts://www.dominio.com"
                    {...register('video', { required: true })}
                />
                {errors.video && <p className="text-xs text-red-500">Debe adjuntar el vídeo.</p>}
            </div>

            <div className="grid gap-1">
                <label htmlFor="transcription">Transcripción</label>
                <input
                    className="p-2 border border-gray-200 rounded"
                    type="url"
                    id="transcription"
                    placeholder="htts://www.dominio.com"
                    {...register('transcription', { required: true })}
                />
                {errors.video && <p className="text-xs text-red-500">Debe adjuntar la transcripción.</p>}
            </div>

            <button className="flex items-center gap-2 justify-center bg-indigo-600 text-white w-full text-center p-2 rounded-lg cursor-pointer hover:bg-indigo-700 disabled:opacity-50" disabled={mutation.isPending}>
                {mutation.isPending && <span className="h-4 w-4 block rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></span>}
                Guardar información
            </button>
        </form>
    )
}

export default ObservationFormMultimedia