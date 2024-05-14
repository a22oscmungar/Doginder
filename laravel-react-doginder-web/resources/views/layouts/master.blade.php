<!DOCTYPE html>
<html lang="es" class="scroll-smooth">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="description" content="">
    <meta name="keywords" content="Doginder">
    <title>@yield('title')</title>
    <!-- <link rel="icon" type="image/x-icon" href="{{ Vite::asset('resources/images/favicon.ico') }}"> -->
    <!-- <link rel="stylesheet" href="{{ mix('css/app.scss') }}"> -->
    <link rel="stylesheet" href="https://unpkg.com/swiper/swiper-bundle.min.css" />
    <script src="https://unpkg.com/swiper/swiper-bundle.min.js"></script>

    @vite(['resources/css/app.scss', 'resources/js/app.js'])
</head>

<body>
<div class="min-h-screen flex flex-col overflow-x-hidden">
        @include('layouts.header')
        <main class="flex-grow">
            @yield('content')
        </main>
        @include('layouts.footer')
    </div>
</body>

</html>
