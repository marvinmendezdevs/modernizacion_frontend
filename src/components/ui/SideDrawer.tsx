import { X } from "lucide-react"
import type React from "react"

type SideDrawerType = {
    children: React.ReactNode,
    setActive: React.Dispatch<React.SetStateAction<number | null >>
}

function SideDrawer({ children, setActive }: SideDrawerType) {

    return (
        <div className="bg-black/75 fixed inset-0 flex justify-end z-100">

            <div className="bg-white h-screen w-11/12 max-w-92 flex flex-col">
                <div className="flex justify-end p-2 border-b border-gray-200 w-11/12 mx-auto">
                    <button className="cursor-pointer" onClick={ () => setActive(null) }>
                        <X />
                    </button>
                </div>
                <div className="flex-1">
                    <div className="w-11/12 mx-auto h-full">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SideDrawer