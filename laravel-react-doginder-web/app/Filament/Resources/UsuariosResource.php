<?php

namespace App\Filament\Resources;


use Filament\Resources\Forms\Components;

use App\Filament\Resources\UsuariosResource\Pages;
use App\Filament\Resources\UsuariosResource\RelationManagers;
use App\Models\Usuarios;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class UsuariosResource extends Resource
{
    protected static ?string $model = Usuarios::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('idUsu')
                    ->disabled() // Disable this if you don't want it to be editable
                    ->label('ID Usuario'),

                    Forms\Components\TextInput::make('bloqueado')
                    ->label('Bloqueado'),
            ])
           ;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->query(Usuarios::query())
            ->columns([
                TextColumn::make('idUsu')->label('idUsu ')->searchable(),
                TextColumn::make('bloqueado')->label('Bloqueado'),
            ])
            ->filters([
                //
            ])
            ->actions([
               // Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsuarios::route('/'),
            'create' => Pages\CreateUsuarios::route('/create'),
            'edit' => Pages\EditUsuarios::route('/{record}/edit'),
        ];
    }
}
