<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Owner;
use Illuminate\Http\Request;

class OwnerController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function current(Request $request)
    {
        return $request->user();
    }

    public function index()
    {
        return Owner::all();
    }
}