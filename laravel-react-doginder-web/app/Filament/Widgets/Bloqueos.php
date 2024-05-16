<?php

namespace App\Filament\Widgets;

use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use App\Filament\Resources\BloqueosResource;

class Bloqueos extends BaseWidget
{
    public function table(Table $table): Table
    {
        return $table
        ->query(BloqueosResource::getEloquentQuery())
        ->columns([
            TextColumn::make('id')->label('Id'),
            TextColumn::make('usuario_bloqueador_id')->label('Usuario'),
            TextColumn::make('usuario_bloqueado_id')->label('Usuario bloqueado'),
            TextColumn::make('fecha_bloqueo')->label('Fecha bloqueo'),
        ]);
    }
}
