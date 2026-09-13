import * as React from "react";

interface EmailTemplateProps {
  fullName: string;
  email: string;
  message: string;
  submittedAt: Date;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  fullName,
  email,
  message,
  submittedAt,
}) => (
  <div>
    <h1>from: {fullName}!</h1>
    <div className="text-red-500">{email} sent you a message</div>
    <blockquote>{message}</blockquote>
    <p>Submitted: {submittedAt.toISOString()}</p>
  </div>
);
