
import './App.css';
import {
  Container, Row, Col, Button, Alert,
  Nav, Navbar, NavDropdown, Breadcrumb, Card, Form
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from "./components/Home";

function App() {
  return (
    <div className="App w-100">
      <header className="App-header w-100">
        <Container className="w-100">
          <Card className="bg-primary-subtle mb-3 w-100">
            <Card.Img className="img-max p-4" src="/images/site/web-dev-color.svg" />
            <Card.Body>
              <Card.Title>Intelligent Web Sytems Engineering</Card.Title>
              <Card.Text>Development & Training</Card.Text>
            </Card.Body>
            <Navbar expand="lg" className="bg-secondary-subtle w-100">
              <Container>
                <Navbar.Brand href="#home">
                  <img
                    src="/images/site/html-black.svg"
                    width="30"
                    height="30"
                    className="d-inline-block align-top"
                    alt="React Bootstrap logo"
                  />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                  <Nav className="me-auto">
                    <Nav.Link href="/">Home</Nav.Link>
                    <Nav.Link href="/courses">Courses</Nav.Link>
                    <Nav.Link href="https://n8n.skasystems.com">n8n</Nav.Link>
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar>
          </Card>
        </Container>

      </header>
      <main>
        <Container>
          <Home />
        </Container>
      </main>
      <footer>
        <Container>
          <Row>
            <Col className="m-3">
              <p>@Copyright 2025 skasystems</p>
              <p><a href="skanderturki@gmail.com">Contact us</a></p>
            </Col>
            {/* <Col className="m-3">
              <Form>
                <Form.Group controlId="formEmail">
                  <Form.Label>Email address:</Form.Label>
                  <Form.Control type="email" placeholder="example@email.com"></Form.Control>
                  <Form.Text className="text-warning" >We'll never share your email</Form.Text>
                </Form.Group>

                <Button variant="secondary" type="submit">Request contact</Button>
              </Form>
            </Col> */}
          </Row>

        </Container>

      </footer>
    </div>
  );
}

export default App;
