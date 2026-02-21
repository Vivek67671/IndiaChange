export const welcomeEmailTemplate = (name) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to IndiaAct</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f7;">
  <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    
    <!-- Proper Big Indian Flag Header -->
    <div style="width: 100%;">
      <div style="height: 50px; background-color: #FF9933; width: 100%;"></div>
      <div style="height: 50px; background-color: #FFFFFF; width: 100%; text-align: center;">
         <div style="line-height: 50px; font-size: 42px; color: #000080; display: inline-block; vertical-align: middle;">☸</div>
      </div>
      <div style="height: 50px; background-color: #138808; width: 100%;"></div>
    </div>
    
    <div style="padding: 30px 40px 20px 40px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; color: #1d1d1f;">Jai Hind, ${name}!</h1>
      <p style="font-size: 16px; color: #86868b; margin-top: 10px;">Welcome to the IndiaAct family.</p>
    </div>

    <div style="padding: 0 40px 40px 40px;">
      <p style="font-size: 16px; color: #1d1d1f;">You have taken a bold step towards building a better nation. IndiaAct is not just an app; it's a revolution led by citizens like you.</p>
      
      <div style="background-color: #f5f5f7; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="margin-top: 0; font-size: 18px; color: #1d1d1f; border-bottom: 1px solid #e5e5e5; padding-bottom: 12px; margin-bottom: 16px;">Your Responsibilities</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top; padding-bottom: 16px; width: 24px;">📢</td>
            <td style="padding-bottom: 16px; padding-left: 12px;">
              <strong style="color: #1d1d1f;">Report Fearlessly</strong>
              <div style="font-size: 14px; color: #666;">Bring hidden issues to light. Your voice is the first step to a solution.</div>
            </td>
          </tr>
          <tr>
            <td style="vertical-align: top; padding-bottom: 16px; width: 24px;">✅</td>
            <td style="padding-bottom: 16px; padding-left: 12px;">
              <strong style="color: #1d1d1f;">Verify Truth</strong>
              <div style="font-size: 14px; color: #666;">Vouch for genuine reports. Help us filter out noise and focus on facts.</div>
            </td>
          </tr>
          <tr>
            <td style="vertical-align: top; width: 24px;">🤝</td>
            <td style="padding-left: 12px;">
              <strong style="color: #1d1d1f;">Act Collectively</strong>
              <div style="font-size: 14px; color: #666;">Join volunteer drives. A clean street starts with a single pair of hands.</div>
            </td>
          </tr>
        </table>
      </div>

      <p style="font-size: 16px; color: #1d1d1f; text-align: center; margin-bottom: 30px;">
        Together, we will turn complaints into action and apathy into accountability.
      </p>

      <div style="text-align: center;">
        <a href="https://indiaact.org/dashboard" style="display: inline-block; background-color: #0071e3; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 30px;">Go to Dashboard</a>
      </div>
    </div>

    <div style="background-color: #f5f5f7; padding: 24px; text-align: center; font-size: 12px; color: #86868b;">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} IndiaAct Foundation. All rights reserved.</p>
      <p style="margin: 5px 0 0 0;">Built for the people, by the people.</p>
    </div>
  </div>
</body>
</html>
`;