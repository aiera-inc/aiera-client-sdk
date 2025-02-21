function fallbackCopyToClipboard(text: string): Promise<void> {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Prevent scrolling to bottom
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);

    try {
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        return Promise.resolve();
    } catch (error) {
        console.warn('Fallback clipboard copy failed:', error);
        return Promise.reject(error);
    } finally {
        document.body.removeChild(textArea);
    }
}

export async function copyToClipboard(text: string): Promise<void> {
    // Modern clipboard API available
    if (window.navigator.clipboard) {
        try {
            // Try direct clipboard write first (works in secure contexts)
            await window.navigator.clipboard.writeText(text);
            return;
        } catch (error) {
            // If direct write fails, check permissions
            try {
                const permissionStatus = await navigator.permissions.query({
                    name: 'clipboard-write' as PermissionName,
                });

                if (permissionStatus.state === 'granted') {
                    await window.navigator.clipboard.writeText(text);
                    return;
                }
            } catch {
                // Permission check failed, fall back to legacy method
            }
        }
    }

    // Fall back to legacy method if any of the above fails
    return fallbackCopyToClipboard(text);
}
