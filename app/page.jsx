export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold mb-4">Happy Hacking!</h1>
            <p className="text-lg">Control de Usuarios</p>
            <div className="mt-8">
                <a
                    href="/administracion/usuariosJD"
                    className="bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Ir a Usuarios
                </a>
            </div>
        </main>
    )
}