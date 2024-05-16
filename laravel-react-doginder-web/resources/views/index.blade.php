@extends('layouts.master')

@section('title', 'Doginder')

@section('content')
<section class="container mx-auto px-4" id="home">
    <div class="flex flex-col lg:flex-row">
        <div class="relative flex justify-center items-center mx-auto pb-4 lg:w-1/2 lg:justify-end ">
            <h1 class="text-center text-4xl lg:text-6xl lg:text-left font-bold lg:max-w-[500px] leading-snug">La app que
                tu perro te hará descargar</h1>
            <img class="hidden lg:block lg:absolute lg:top-4 lg:left-36 xl:left-72"
                src="{{ Vite::asset('resources/images/dog-mobile.png') }}" width="120" height="120" alt="Doginder">
        </div>
        <div class=" flex justify-center lg:w-1/2 ">
            <div class="relative">
                <img src="{{ Vite::asset('resources/images/mobile-profile.png') }}" width="253" height="506"
                    alt="Doginder" class="relative max-w-[506px] max-h-[710px] shrink-0">
                <img class="absolute top-12 -right-12 rotate-90 z-10 shrink-0 lg:hidden"
                    src="{{ Vite::asset('resources/images/dog-mobile.png') }}" width="80" height="80" alt="Doginder">
            </div>
        </div>
    </div>
</section>
<section class=" bg-orange-300 " id="opinions">
    <div class="swiper-container">
        <div
            class="swiper-wrapper mx-2 py-5 [&>*]:flex [&>*]:flex-col [&>*]:justify-center [&>*]:items-center [&>*]:text-center [&>*]:bg-orange-200 [&>*]:p-5 [&>*]:rounded-lg">
            <div class="swiper-slide">
                <img src="{{ Vite::asset('resources/images/lenin.jpg') }}" width="100" height="100" alt=" "
                    class="rounded-full mb-2">
                <p class="italic text-gray-800">¡Es como si mi cola estuviera en modo turbo todo el tiempo!
                </p>
                <div class="flex">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" "  aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_empty.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                </div>
            </div>
            <div class="swiper-slide">
                <img src="{{ Vite::asset('resources/images/coco.png') }}" width="100" height="100" alt=" "
                    class="rounded-full mb-2">
                <p class="italic">Me hago pipi de la emoción al saber que tengo compañía para pasear</p>
                <div class="flex">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                </div>
            </div>
            <div class="swiper-slide">
                <img src="{{ Vite::asset('resources/images/anuk.jpg') }}" width="100" height="100" alt=" "
                    class="rounded-full mb-2">
                <p class="italic">He aprendido a compartir mis juguetes con mis nuevos amigos</p>
                <div class="flex">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                </div>
            </div>
            <div class="swiper-slide">
                <img src="{{ Vite::asset('resources/images/flama.jpg') }}" width="100" height="100" alt=" "
                    class="rounded-full mb-2">
                <p class="italic">Ahora tengo tantos amigos que me faltan patas para contarlos</p>
                <div class="flex">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_empty.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                </div>
            </div>
            <div class="swiper-slide">
                <img src="{{ Vite::asset('resources/images/koke.jpg') }}" width="100" height="100" alt=" "
                    class="rounded-full mb-2">
                <p class="italic">Ahora ladro más, </p>
                <p>¡pero de felicidad!</p>
                <div class="flex">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                    <img src="{{ Vite::asset('resources/images/icon_bone_full.svg') }}" width="20px" height="20px"
                        alt=" " aria-hidden="true">
                </div>
            </div>
        </div>
    </div>
</section>
<section id="comercial">
    <div class="flex flex-col justify-center items-center text-center p-5">
        <p class="text-3xl font-bold text-center">Anuncio</p>

        <video class="w-full rounded-lg lg:w-[700px] py-5" controls>
            <source src="{{ Vite::asset('resources/images/AnuncioDoginder.mp4') }}" type="video/mp4">
            Your browser does not support the video tag.
        </video>

        <p class="pt-5 text-2xl">Fácil y sencilla de usar, apta para cualquier persona y cualquier pata</p>
    </div>
</section>
<section class="bg-orange-200 py-5 " id="use">
    <p class="text-3xl font-bold text-center">¿Como uso la app?</p>
    <div class="py-5 flex flex-col lg:flex-row">
        <div class="lg:w-1/2 flex justify-center lg:justify-end">
            <img class="max-w-80 lg:max-w-[500px] shrink-0" src="{{ Vite::asset('resources/images/services-doginder.png') }}" width="963"
                height="817" />
        </div>
        <div
            class="lg:w-1/2 [&>*]:border-2 space-y-5 [&>*]:border-orange-300 [&>*]:rounded-lg [&>*]:p-5 px-5 lg:px-12 py-5 lg:py-0 ">
            <div class="">
                <p class="font-bold text-2xl">1.</p>
                <p>Descarga Doginder en tu dispositivo móvil</p>
            </div>
            <div class="">
                <p class="font-bold text-2xl">2.</p>
                <p>Elige la opción que más se adapte a ti</p>
            </div>
            <div class="">
                <p class="font-bold text-2xl">3.</p>
                <p>¡Conecta con otro perfil!</p>
            </div>
            <div class="">
                <p class="font-bold text-2xl">4.</p>
                <p>¡Chatea y vive nuevas experiencias!</p>
            </div>
        </div>
    </div>
</section>
<section class="mx-2" id="download">
    <div class="pt-7">
        <p class="text-3xl text-center font-medium">Prueba <span class="italic font-bold">Doginder</span>, no te
            arrepentirás</p>

        <div class="flex flex-col-reverse lg:flex-row justify-center gap-x-4 mt-10 items-center">
            <div class="tenor-gif-embed w-36 h-36 mt-5 lg:w-96 lg:h-96" data-postid="17943017" data-share-method="host" data-aspect-ratio="1"></div>
            <script type="text/javascript" async src="https://tenor.com/embed.js"></script>
            <div class="flex flex-row justify-center gap-4">
                <img class="w-36 lg:w-52" src="{{ Vite::asset('resources/images/app_store.png') }}" width="1280" height="427"  />
                <img class="w-36 lg:w-52" src="{{ Vite::asset('resources/images/google_play.png') }}" width="1280" height="427"  />
                
            </div>
        </div>
    </div>
</section>

@endsection