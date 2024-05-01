@extends('layouts.master')

@section('title', 'Doginder')

@section('content')
<!-- header -->
<!-- body -->
<section>
    <h1 class="text-3xl text-center w-24 font-bold">La app que tu perro te hará descargar</h1>
    <div class="flex justify-center absolute top-0 right-0">
        <img src="{{ Vite::asset('resources/images/mobile-profile.png') }}" width="253" height="506" alt="Doginder">
        <img class="realtive top-4 right-5 rotate-90" src="{{ Vite::asset('resources/images/dog-mobile.png') }}" width="120" height="120" alt="Doginder">
    </div>
</section>

@endsection