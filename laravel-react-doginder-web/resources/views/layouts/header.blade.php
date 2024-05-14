<header class="header">
    <nav class="container-fluid p-8">
        <div class="flex flex-wrap lg:flex-nowrap justify-between items-center">
            <a href="/" class="flex items-center">
                <img src="{{ Vite::asset('resources/images/logo_doginder.png') }}" class="ml-4 h-7 lg:h-9" alt="Doginder Logo" />
            </a>
            <div class="flex items-center lg:order-2">
                <a href="tel:931596006" class="font-medium mr-2 sm:mr-3 lg:mr-6 flex items-center">
                    <img src="{{ Vite::asset('resources/images/icon_instagram.svg') }}" class="ml-4 h-7 lg:h-9" alt="Doginder Logo" />
                </a>
                <a href="tel:931596006" class="font-medium mr-2 sm:mr-3 lg:mr-6 flex items-center">
                    <img src="{{ Vite::asset('resources/images/icon_youtube.svg') }}" class="ml-4 h-7 lg:h-9" alt="Doginder Logo" />
                </a>
                <button type="button" id="nav-button"
                    class="inline-flex items-center p-2 ml-1 text-sm rounded-lg lg:hidden
                    bg-slate-200 hover:bg-slate-300">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd"
                            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clip-rule="evenodd"></path>
                    </svg>
                    <svg class="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
            <div class="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1" id="nav-menu">
                <ul class="flex flex-col mt-4 font-medium lg:flex-row align-center lg:space-x-6 xl:space-x-8 lg:mt-0 divide-y lg:divide-y-0">
                    <li>
                        <a href="#home" class="block py-2 hover:text-primary lg:p-0 text-gray-700">Inicio</a>
                    </li>
                    <li>
                        <a href="#opinions" class="block py-2 hover:text-primary lg:p-0 text-gray-700">Opiniones</a>
                    </li>
                    <li>
                        <a href="#comercial" class="block py-2 hover:text-primary lg:p-0 text-gray-700">Anuncio</a>
                    </li>
                    <li>
                        <a href="#use" class="block py-2 hover:text-primary lg:p-0 text-gray-700">Uso</a>
                    </li>
                    <li>
                        <a href="#download" class="block py-2 hover:text-primary lg:p-0 text-gray-700">Contacto</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</header>
