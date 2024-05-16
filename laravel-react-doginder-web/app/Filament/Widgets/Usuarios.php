<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\UsuariosResource;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Widgets\TableWidget as BaseWidget;

class Usuarios extends BaseWidget
{
    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('idUsu')
                    ->disabled() // Disable this if you don't want it to be editable
                    ->label('ID Usuario'),

                    Forms\Components\TextInput::make('bloqueado')
                    ->label('Bloqueado'),
            ])
            ->context(static::class);
    }
    public function table(Table $table): Table
    {
        return $table
            ->query(UsuariosResource::getEloquentQuery())
            ->columns([
                TextColumn::make('idUsu')->label('Id'),
                TextColumn::make('bloqueado')->label('Bloqueado'),
            ])
            ->actions([
                //Tables\Actions\EditAction::make(),
            ]);
    }
}
