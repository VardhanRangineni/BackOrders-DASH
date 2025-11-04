import React, { useState } from 'react';
import { Row, Col, Card, Modal, Table, Badge } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { dateDiffInDays } from '../utils/utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const HomeOverview = ({ webOrders, sourcingOrders }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: '', content: null });

  const handleCardClick = (type) => {
    let title = '';
    let content = null;

    switch(type) {
      case 'total':
        title = 'Total Back Orders - Detailed Breakdown';
        content = (
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Age (Days)</th>
              </tr>
            </thead>
            <tbody>
              {webOrders.slice(0, 10).map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>
                    <Badge bg={order.overallStatus === 'Completed' ? 'success' : 'warning'} text="dark">
                      {order.overallStatus || order.status}
                    </Badge>
                  </td>
                  <td>{order.age}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        );
        break;
      
      case 'pending':
        const pendingOrders = webOrders.filter(o => (o.overallStatus || o.status) === 'Pending Sourcing');
        title = `Pending Sourcing Orders (${pendingOrders.length})`;
        content = (
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Age (Days)</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>
                    <Badge bg={order.age > 7 ? 'danger' : order.age > 3 ? 'warning' : 'info'} text="dark">
                      {order.age}
                    </Badge>
                  </td>
                  <td>{order.items?.length || 1}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        );
        break;
      
      case 'sourcing':
        title = `Total Sourcing Documents (${sourcingOrders.length})`;
        content = (
          <div>
            <Row className="mb-3">
              <Col>
                <div className="p-3 bg-light rounded">
                  <h6>Transfer Orders (TO)</h6>
                  <h4>{sourcingOrders.filter(o => o.type === 'TO').length}</h4>
                </div>
              </Col>
              <Col>
                <div className="p-3 bg-light rounded">
                  <h6>Purchase Orders (PO)</h6>
                  <h4>{sourcingOrders.filter(o => o.type === 'PO').length}</h4>
                </div>
              </Col>
            </Row>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Doc ID</th>
                  <th>Status</th>
                  <th>Web Order</th>
                </tr>
              </thead>
              <tbody>
                {sourcingOrders.slice(0, 10).map(order => (
                  <tr key={order.id}>
                    <td><Badge bg={order.type === 'TO' ? 'primary' : 'info'} text="dark">{order.type}</Badge></td>
                    <td>{order.docId}</td>
                    <td><Badge bg={order.status === 'Fulfilled' ? 'success' : 'warning'} text="dark">{order.status}</Badge></td>
                    <td>{order.webOrder}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        );
        break;
      
      case 'retry':
        const retriedOrders = sourcingOrders.filter(o => o.retry > 0);
        title = `Retry Analysis (${retriedOrders.length} Retries)`;
        content = (
          <div>
            <Row className="mb-3">
              <Col md={6}>
                <div className="p-3 bg-light rounded">
                  <h6>Successful Retries</h6>
                  <h4 className="text-success">{retriedOrders.filter(o => o.status === 'Fulfilled').length}</h4>
                </div>
              </Col>
              <Col md={6}>
                <div className="p-3 bg-light rounded">
                  <h6>Failed Retries</h6>
                  <h4 className="text-danger">{retriedOrders.filter(o => o.status === 'Rejected').length}</h4>
                </div>
              </Col>
            </Row>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Doc ID</th>
                  <th>Retry Count</th>
                  <th>Status</th>
                  <th>Batch ID</th>
                </tr>
              </thead>
              <tbody>
                {retriedOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.docId}</td>
                    <td><Badge bg="warning" text="dark">{order.retry}</Badge></td>
                    <td><Badge bg={order.status === 'Fulfilled' ? 'success' : 'danger'} text="dark">{order.status}</Badge></td>
                    <td>{order.batchId}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        );
        break;
      
      default:
        return;
    }

    setModalData({ title, content });
    setShowModal(true);
  };

  const calculateKPIs = () => {
    const total = webOrders.length;
    const completed = webOrders.filter(o => (o.overallStatus || o.status) === 'Completed');
    const fulfilledOrders = webOrders.filter(o => {
      const status = o.overallStatus || o.status;
      return status === 'Completed' || status === 'Partially Fulfilled';
    });
    
    let totalDays = 0;
    completed.forEach(o => {
      const createdDate = new Date(o.created);
      const updatedDate = new Date(o.lastUpdated);
      totalDays += dateDiffInDays(createdDate, updatedDate);
    });

    const retriedOrders = sourcingOrders.filter(o => o.retry > 0);
    const successfulRetries = retriedOrders.filter(o => o.status === 'Fulfilled');
    const retryRate = retriedOrders.length > 0 ? ((successfulRetries.length / retriedOrders.length) * 100).toFixed(0) : 0;

    return {
      total,
      pending: webOrders.filter(o => (o.overallStatus || o.status) === 'Pending Sourcing').length,
      rate: total > 0 ? ((fulfilledOrders.length / total) * 100).toFixed(0) : 0,
      avgTime: completed.length > 0 ? (totalDays / completed.length).toFixed(1) : 0,
      totalSourcing: sourcingOrders.length,
      pendingStore: sourcingOrders.filter(o => o.type === 'TO' && (o.status === 'Draft' || o.status === 'Accepted')).length,
      retryRate
    };
  };

  const kpis = calculateKPIs();

  // Ageing Chart Data
  const pendingOrders = webOrders.filter(o => {
    const status = o.overallStatus || o.status;
    return status === 'Pending Sourcing' || status === 'Partially Fulfilled';
  });
  const ageingData = {
    labels: ['0-3 Days', '3-7 Days', '>7 Days'],
    datasets: [{
      label: 'Pending Orders',
      data: [
        pendingOrders.filter(o => o.age >= 0 && o.age <= 3).length,
        pendingOrders.filter(o => o.age > 3 && o.age <= 7).length,
        pendingOrders.filter(o => o.age > 7).length
      ],
      backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(220, 38, 38, 0.7)'],
      borderWidth: 1
    }]
  };

  // Source Chart Data
  const sourceData = {
    labels: ['Store (TO)', 'Distributor (PO)', 'Pending', 'Other'],
    datasets: [{
      data: [
        webOrders.filter(o => {
          if (o.items) {
            return o.items.some(item => item.source.includes('Store'));
          }
          return o.source && o.source.includes('Store');
        }).length,
        webOrders.filter(o => {
          if (o.items) {
            return o.items.some(item => item.source.includes('Distributor'));
          }
          return o.source && o.source.includes('Distributor');
        }).length,
        webOrders.filter(o => {
          if (o.items) {
            return o.items.some(item => item.source.includes('Pending'));
          }
          return o.source && o.source.includes('Pending');
        }).length,
        webOrders.filter(o => {
          if (o.items) {
            return o.items.every(item => !item.source.includes('Store') && !item.source.includes('Distributor') && !item.source.includes('Pending'));
          }
          return o.source && !o.source.includes('Store') && !o.source.includes('Distributor') && !o.source.includes('Pending');
        }).length
      ],
      backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(139, 92, 246, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(107, 114, 128, 0.7)'],
      hoverOffset: 4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 20 } }
    }
  };

  return (
    <div>
      <h2 className="mb-4 fw-bold">Home Overview</h2>
      
      {/* Aggregated KPIs */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={4} xl={3}>
          <Card className="kpi-card clickable-card h-100" onClick={() => handleCardClick('total')}>
            <Card.Body>
              <div className="kpi-title">
                Total Back Orders
                <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
              </div>
              <div className="kpi-value">{kpis.total}</div>
              <div className="kpi-subtitle">Click for details</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4} xl={3}>
          <Card className="kpi-card clickable-card h-100" onClick={() => handleCardClick('pending')}>
            <Card.Body>
              <div className="kpi-title">
                Pending Sourcing
                <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
              </div>
              <div className="kpi-value">{kpis.pending}</div>
              <div className="kpi-subtitle">Click for details</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4} xl={3}>
          <Card className="kpi-card h-100">
            <Card.Body>
              <div className="kpi-title">Fulfilment Rate</div>
              <div className="kpi-value text-success">{kpis.rate}%</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4} xl={3}>
          <Card className="kpi-card h-100">
            <Card.Body>
              <div className="kpi-title">Avg. Fulfilment Time (W.O.)</div>
              <div className="kpi-value">{kpis.avgTime} Days</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4} xl={3}>
          <Card className="kpi-card clickable-card h-100" onClick={() => handleCardClick('sourcing')}>
            <Card.Body>
              <div className="kpi-title">
                Total Sourcing Docs (TO/PO)
                <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
              </div>
              <div className="kpi-value">{kpis.totalSourcing}</div>
              <div className="kpi-subtitle">Click for details</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4} xl={3}>
          <Card className="kpi-card h-100">
            <Card.Body>
              <div className="kpi-title">Pending Store Requests (TO)</div>
              <div className="kpi-value">{kpis.pendingStore}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4} xl={3}>
          <Card className="kpi-card clickable-card h-100" onClick={() => handleCardClick('retry')}>
            <Card.Body>
              <div className="kpi-title">
                Retry Success Rate
                <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
              </div>
              <div className="kpi-value text-primary">{kpis.retryRate}%</div>
              <div className="kpi-subtitle">Click for details</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Aggregated Charts */}
      <Row className="g-3">
        <Col xs={12} lg={6}>
          <Card className="chart-container h-100">
            <Card.Body>
              <h5 className="fw-bold mb-3">Pending Order Ageing</h5>
              <div className="chart-wrapper" style={{ height: '320px' }}>
                <Bar data={ageingData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="chart-container h-100">
            <Card.Body>
              <h5 className="fw-bold mb-3">Source Contribution</h5>
              <div className="chart-wrapper d-flex justify-content-center" style={{ height: '320px' }}>
                <Doughnut data={sourceData} options={doughnutOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Modal for detailed insights */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalData.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {modalData.content}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default HomeOverview;
