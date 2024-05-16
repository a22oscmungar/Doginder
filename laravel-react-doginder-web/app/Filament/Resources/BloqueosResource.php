<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BloqueosResource\Pages;
use App\Filament\Resources\BloqueosResource\RelationManagers;
use App\Models\Bloqueos;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class BloqueosResource extends Resource
{
    protected static ?string $model = Bloqueos::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                //
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->query(Bloqueos::query())
            ->columns([
                TextColumn::make('estado')->label('Estado')->translateLabel()->sortable()->badge(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
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
            'index' => Pages\ListBloqueos::route('/'),
            'create' => Pages\CreateBloqueos::route('/create'),
            'edit' => Pages\EditBloqueos::route('/{record}/edit'),
        ];
    }
}
