type Position = `bottom-left` | `bottom-right`;

interface Branding {
  primaryColor: string;
  accentColor: string;
  textColor: string;
}

interface ChatbotSettings {
  title: string;
  position: Position;
  branding: Branding;
}