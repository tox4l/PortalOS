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

type CommentNotificationEmailProps = {
  agencyName: string;
  recipientName: string;
  commenterName: string;
  projectName: string;
  commentBody: string;
  projectUrl: string;
};

export function CommentNotificationEmail({
  agencyName,
  recipientName,
  commenterName,
  projectName,
  commentBody,
  projectUrl,
}: CommentNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{commenterName} commented on {projectName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>{agencyName}</Text>
          </Section>
          <Section style={content}>
            <Heading style={heading}>New comment</Heading>
            <Text style={paragraph}>Hi {recipientName},</Text>
            <Text style={paragraph}>
              <strong>{commenterName}</strong> left a comment on{" "}
              <strong>{projectName}</strong>:
            </Text>
            <Section style={quoteBox}>
              <Text style={quote}>{commentBody}</Text>
            </Section>
            <Button href={projectUrl} style={button}>
              View project
            </Button>
            <Hr style={hr} />
            <Text style={footer}>
              {agencyName} via PortalOS · Manage notifications in your settings.
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

const quoteBox: React.CSSProperties = {
  backgroundColor: "#FDFAF7",
  borderRadius: "10px",
  border: "1px solid #E7DFD4",
  padding: "16px 20px",
  margin: "16px 0 24px",
  borderLeft: "3px solid #8C7340",
};

const quote: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#5C4E3D",
  fontStyle: "italic",
};

const button: React.CSSProperties = {
  backgroundColor: "#8C7340",
  color: "#FFFFFF",
  borderRadius: "10px",
  padding: "12px 24px",
  fontSize: "14px",
  fontWeight: "500",
  textDecoration: "none",
  display: "inline-block",
};

const hr: React.CSSProperties = {
  borderColor: "#E7DFD4",
  margin: "24px 0",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#8C7B67",
};
