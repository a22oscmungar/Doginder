<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bloqueos extends Model
{
    use HasFactory;
    protected $table = 'BLOQUEOS';
    protected $primaryKey = 'id';
}
