<footer class="bg-gray-100 p-8 lg:py-10 text-gray-600">
    <div class="container-fluid">
        <div class="md:grid grid-cols-4 gap-x-10">
            <div class="col-span-2">
                <img src="{{ Vite::asset('resources/images/logo_doginder.png') }}" width="150" height="50" alt="Doginder" />
            </div>
            <div class="pt-4 lg:col-span-2 lg:flex lg:flex-col lg:items-end lg:text-right">
                <p class="font-bold mb-2 lg:mb-4 text-lg text-gray-800">Páginas legales</p>
                <ul class="space-y-3">
                    <li><a href="/" class="underline hover:no-underline">Aviso legal</a></li>
                    <li><a href="/" class="underline hover:no-underline">Política de privacidad</a></li>
                    <li><a href="/" class="underline hover:no-underline">Política de cookies<a></li>
                </ul>
            </div>
        </div>
        <div class="border-t border-t-slate-200 mt-8 pt-6 text-center text-xs text-gray-500">
            Doginder &copy; {{ date('Y') }}
        </div>
    </div>
</footer>
