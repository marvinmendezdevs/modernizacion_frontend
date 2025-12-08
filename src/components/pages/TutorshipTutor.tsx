import { useState } from "react";
import { FunnelX, Search } from "lucide-react";
import SearchTutor from "./SearchTutor";

function TutorshipTutor() {
    const [search, setSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [readOnly, setReadOnly] = useState(false)

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!searchTerm.length) return;

        setReadOnly(true);
        setSearch(searchTerm);
    }

    const handleSearchTerm = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.currentTarget.value);

    const handleRemoveFilter = () => {
        setReadOnly(false);
        setSearch('');
    }

    return (
        <>
            <div className="flex justify-between">
                <h2 className="font-bold text-indigo-700 text-2xl">Buscar docente</h2>

                <div className="flex gap-3 items-center">
                    {search && <FunnelX className="text-red-500" size={20} onClick={handleRemoveFilter} />}
                    <form className="flex border border-gray-200 rounded-full items-center overflow-hidden px-1" onSubmit={handleSearch}>
                        <input className="p-2 outline-0" placeholder="Digite DUI del docente" type="text" name="search" id="search" readOnly={readOnly} onChange={handleSearchTerm} />
                        <button className="p-2">
                            <Search />
                        </button>
                    </form>
                </div>

            </div>
            {!search.length ? (
                <p className="my-5 text-sm text-center">Realice un búsque de docente por DUI</p>
            ) : (
                <SearchTutor
                    search={search}
                />
            )}
        </>
    )
}

export default TutorshipTutor
