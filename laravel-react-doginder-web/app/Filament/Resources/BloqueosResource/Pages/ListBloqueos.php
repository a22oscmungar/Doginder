<?php

namespace App\Filament\Resources\BloqueosResource\Pages;

use App\Filament\Resources\BloqueosResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListBloqueos extends ListRecords
{
    protected static string $resource = BloqueosResource::class;

    protected function getHeaderActions(): array
    {
        return [
            //Actions\CreateAction::make(),
        ];
    }
}
