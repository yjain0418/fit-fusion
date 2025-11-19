import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      console.error('OAuth error:', { error, errorDescription });
      
      let userFriendlyError = error;
      if (error === 'access_denied') {
        userFriendlyError = 'Access denied. This app is in testing mode.';
      }
      
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Error</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error { color: #dc3545; background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px; }
              .info { color: #0c5460; background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px; }
            </style>
          </head>
          <body>
            <div class="error">
              <h2>Authentication Failed</h2>
              <p><strong>Error:</strong> ${userFriendlyError}</p>
              ${errorDescription ? `<p><strong>Details:</strong> ${errorDescription}</p>` : ''}
            </div>
            ${error === 'access_denied' ? `
              <div class="info">
                <h3>This app is in testing mode</h3>
                <p>Only approved test users can access google integration.</p>
                <p>Please contact the developer to add your email as a test user.</p>
              </div>
            ` : ''}
            <p>This window will close automatically in 10 seconds.</p>
            <script>
              localStorage.setItem('googleFitError', '${error}');
              setTimeout(() => window.close(), 10000);
            </script>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    if (!code) {
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head><title>Authentication Error</title></head>
          <body>
            <h2>No Authorization Code</h2>
            <p>Please close this window and try again.</p>
            <script>
              localStorage.setItem('googleFitError', 'no_code');
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google-fit/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Connected</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              margin: 0;
            }
            .container {
              background: rgba(255,255,255,0.1);
              padding: 30px;
              border-radius: 15px;
              max-width: 400px;
              margin: 0 auto;
              backdrop-filter: blur(10px);
            }
            .success { color: #28a745; font-size: 48px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✓</div>
            <h2>Google Connected Successfully!</h2>
            <p>You can now view your real-time fitness data.</p>
            <p><small>This window will close automatically.</small></p>
          </div>
          <script>
            try {
              localStorage.setItem('googleFitToken', '${tokens.access_token}');
              localStorage.setItem('googleFitRefreshToken', '${tokens.refresh_token || ''}');
              localStorage.setItem('googleFitConnected', 'true');
              localStorage.setItem('googleFitConnectedAt', '${new Date().toISOString()}');
              localStorage.removeItem('googleFitError');
              
              setTimeout(() => window.close(), 2000);
            } catch (error) {
              console.error('Error saving tokens:', error);
              localStorage.setItem('googleFitError', 'save_failed');
            }
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Error</title></head>
        <body>
          <h2>Authentication Failed</h2>
          <p>Error: ${error.message}</p>
          <script>
            localStorage.setItem('googleFitError', '${error.message}');
            setTimeout(() => window.close(), 5000);
          </script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' }, status: 500 });
  }
}