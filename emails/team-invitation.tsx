import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type TeamInvitationEmailProps = {
  agencyName: string;
  inviterName: string;
  inviteUrl: string;
  role: string;
};

export function TeamInvitationEmail({
  agencyName,
  inviterName,
  inviteUrl,
  role,
}: TeamInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{inviterName} invited you to join {agencyName} on PortalOS</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>{agencyName}</Text>
          </Section>
          <Section style={content}>
            <Heading style={heading}>You&apos;re invited</Heading>
            <Text style={paragraph}>Hi there,</Text>
            <Text style={paragraph}>
              <strong>{inviterName}</strong> has invited you to join{" "}
              <strong>{agencyName}</strong> on PortalOS as a{" "}
              <strong>{role}</strong>.
            </Text>
            <Text style={paragraph}>
              Click the button below to set up your account and start collaborating.
            </Text>
            <Button href={inviteUrl} style={button}>
              Accept invitation
            </Button>
            <Hr style={hr} />
            <Text style={footer}>
              {agencyName} via PortalOS · This invitation was sent by {inviterName}.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#FDFAF7",
  fontFamily: "DM Sans, Arial, sans-serif",
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "32px 0",
};

const header: React.CSSProperties = {
  padding: "24px 32px",
};

const logo: React.CSSProperties = {
  fontFamily: "Cormorant Garamond, Georgia, serif",
  fontSize: "24px",
  color: "#1E1208",
};

const content: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  border: "1px solid #E7DFD4",
  padding: "32px",
};

const heading: React.CSSProperties = {
  fontFamily: "Cormorant Garamond, Georgia, serif",
  fontSize: "28px",
  fontWeight: "400",
  color: "#1E1208",
  margin: "0 0 24px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#5C4E3D",
  margin: "0 0 16px",
};

const button: React.CSSProperties = {
  backgroundColor: "#D4607A",
  color: "#FFFFFF",
  borderRadius: "10px",
  padding: "12px 24px",
  fontSize: "14px",
  fontWeight: "500",
  textDecoration: "none",
  display: "inline-block",
  marginTop: "8px",
};

const hr: React.CSSProperties = {
  borderColor: "#E7DFD4",
  margin: "24px 0",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#8C7B67",
};
