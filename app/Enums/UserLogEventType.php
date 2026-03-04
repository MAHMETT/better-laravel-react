<?php

namespace App\Enums;

enum UserLogEventType: string
{
    case Login = 'login';
    case Logout = 'logout';
    case ForcedLogout = 'forced_logout';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
