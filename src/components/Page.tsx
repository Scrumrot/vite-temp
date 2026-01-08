import NavBar from "@/components/NavBar.tsx";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import type { ReactNode } from "react";

export interface PageProps {
  title?: string; // get from context later
  children?: ReactNode;
}

export function Page(props: PageProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar title={props.title} />
      <Container
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {props.children}
      </Container>
    </Box>
  );
}
