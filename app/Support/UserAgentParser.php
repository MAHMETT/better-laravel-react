<?php

namespace App\Support;

class UserAgentParser
{
    public function parse(?string $userAgent): string
    {
        if (! is_string($userAgent) || trim($userAgent) === '') {
            return 'Unknown';
        }

        $normalized = strtolower($userAgent);
        $browser = $this->detectBrowser($normalized);
        $operatingSystem = $this->detectOperatingSystem($normalized);
        $deviceClass = $this->detectDeviceClass($normalized);

        return sprintf('%s on %s (%s)', $browser, $operatingSystem, $deviceClass);
    }

    protected function detectBrowser(string $normalizedUserAgent): string
    {
        return match (true) {
            str_contains($normalizedUserAgent, 'edg/') => 'Edge',
            str_contains($normalizedUserAgent, 'opr/'),
            str_contains($normalizedUserAgent, 'opera') => 'Opera',
            str_contains($normalizedUserAgent, 'firefox/') => 'Firefox',
            str_contains($normalizedUserAgent, 'chrome/') && ! str_contains($normalizedUserAgent, 'edg/')
                && ! str_contains($normalizedUserAgent, 'opr/') => 'Chrome',
            str_contains($normalizedUserAgent, 'safari/') && ! str_contains($normalizedUserAgent, 'chrome/') => 'Safari',
            str_contains($normalizedUserAgent, 'msie'),
            str_contains($normalizedUserAgent, 'trident/') => 'Internet Explorer',
            default => 'Other',
        };
    }

    protected function detectOperatingSystem(string $normalizedUserAgent): string
    {
        return match (true) {
            str_contains($normalizedUserAgent, 'android') => 'Android',
            str_contains($normalizedUserAgent, 'iphone'),
            str_contains($normalizedUserAgent, 'ipad'),
            str_contains($normalizedUserAgent, 'ipod') => 'iOS',
            str_contains($normalizedUserAgent, 'windows') => 'Windows',
            str_contains($normalizedUserAgent, 'mac os'),
            str_contains($normalizedUserAgent, 'macintosh') => 'macOS',
            str_contains($normalizedUserAgent, 'linux') => 'Linux',
            default => 'Other',
        };
    }

    protected function detectDeviceClass(string $normalizedUserAgent): string
    {
        return match (true) {
            str_contains($normalizedUserAgent, 'ipad'),
            str_contains($normalizedUserAgent, 'tablet') => 'Tablet',
            str_contains($normalizedUserAgent, 'mobile') => 'Mobile',
            str_contains($normalizedUserAgent, 'android') && ! str_contains($normalizedUserAgent, 'mobile') => 'Tablet',
            default => 'Desktop',
        };
    }
}
