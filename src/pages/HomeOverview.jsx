import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { dateDiffInDays } from '../utils/utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const HomeOverview = ({ webOrders, sourcingOrders, onNavigate, setWebOrderFilters, setSourcingFilters }) => {

  const handleCardClick = (type) => {
    switch(type) {
      case 'total':
        // Navigate to Web Order Backlog with no filters (show all)
        setWebOrderFilters({});
        onNavigate('web-order');
        break;
      
      case 'pending':
        // Navigate to Web Order Backlog filtered by Pending Sourcing
        setWebOrderFilters({ statusFilter: 'Pending Sourcing' });
        onNavigate('web-order');
        break;
      
      case 'sourcing':
        // Navigate to Sourcing View with no filters (show all)
        setSourcingFilters({});
        onNavigate('sourcing');
        break;
      
      case 'retry':
        // Navigate to Sourcing View filtered by retry > 0
        setSourcingFilters({ showRetryOnly: true });
        onNavigate('sourcing');
        break;
      
      default:
        break;
    }
  };

  // Handle chart clicks with filtering
  const handleChartClick = (event, chart, chartType) => {
    const activePoints = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
    
    if (activePoints.length > 0) {
      const clickedIndex = activePoints[0].index;
      
      switch(chartType) {
        case 'ageing':
          // Navigate to Web Order Backlog with Pending Sourcing filter
          setWebOrderFilters({ statusFilter: 'Pending Sourcing' });
          onNavigate('web-order');
          break;
          
        case 'source':
          // Navigate to Web Order Backlog with source filter
          const sources = ['Store', 'Distributor', 'Pending'];
          setWebOrderFilters({ sourceFilter: sources[clickedIndex] });
          onNavigate('web-order');
          break;
          
        case 'sourcingRatio':
          // Navigate to Sourcing View with type filter
          if (clickedIndex === 0) {
            setSourcingFilters({ typeFilter: 'TO' });
          } else if (clickedIndex === 1) {
            setSourcingFilters({ typeFilter: 'PO' });
          } else if (clickedIndex === 2) {
            setSourcingFilters({ marketPurchaseOnly: true });
          }
          onNavigate('sourcing');
          break;
          
        case 'sourcingStatus':
          // Navigate to Sourcing View with status filter
          const statuses = ['Draft', 'Accepted', 'In Dispatch', 'Fulfilled', 'Rejected'];
          setSourcingFilters({ statusFilter: statuses[clickedIndex] });
          onNavigate('sourcing');
          break;
          
        case 'marketPurchase':
          // Navigate to Sourcing View with market purchase and status filter
          const mpStatuses = ['Approved', 'In Progress', 'Fulfilled'];
          setSourcingFilters({ marketPurchaseOnly: true, statusFilter: mpStatuses[clickedIndex] });
          onNavigate('sourcing');
          break;
          
        default:
          break;
      }
    }
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
    labels: ['Store (TO)', 'Distributor (PO)', 'Pending'],
    datasets: [{
      data: [
        webOrders.filter(o => {
          if (o.items) {
            return o.items.some(item => item.source && item.source.includes('Store'));
          }
          return o.source && o.source.includes('Store');
        }).length,
        webOrders.filter(o => {
          if (o.items) {
            return o.items.some(item => item.source && item.source.includes('Distributor'));
          }
          return o.source && o.source.includes('Distributor');
        }).length,
        webOrders.filter(o => {
          if (o.items) {
            return o.items.some(item => item.source && item.source.includes('Pending'));
          }
          return o.source && o.source.includes('Pending');
        }).length
      ],
      backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(139, 92, 246, 0.7)', 'rgba(245, 158, 11, 0.7)'],
      hoverOffset: 4
    }]
  };

  // Sourcing Ratio Data
  const sourcingRatioData = {
    labels: ['Store (TO)', 'Distributor (PO)', 'Market Purchase'],
    datasets: [{
      data: [
        sourcingOrders.filter(o => o.type === 'TO').length,
        sourcingOrders.filter(o => o.type === 'PO').length,
        sourcingOrders.filter(o => o.marketPurchase === true).length
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)', 
        'rgba(139, 92, 246, 0.7)', 
        'rgba(245, 158, 11, 0.7)'
      ],
      hoverOffset: 4
    }]
  };

  // Sourcing Status Data
  const sourcingStatusData = {
    labels: ['Draft', 'Accepted', 'In Dispatch', 'Fulfilled', 'Rejected'],
    datasets: [{
      label: 'Sourcing Status',
      data: [
        sourcingOrders.filter(o => o.status === 'Draft').length,
        sourcingOrders.filter(o => o.status === 'Accepted').length,
        sourcingOrders.filter(o => o.status === 'In Dispatch').length,
        sourcingOrders.filter(o => o.status === 'Fulfilled').length,
        sourcingOrders.filter(o => o.status === 'Rejected').length
      ],
      backgroundColor: [
        'rgba(245, 158, 11, 0.7)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(220, 38, 38, 0.7)'
      ],
      borderWidth: 1
    }]
  };

  // Market Purchase Data
  const marketPurchaseData = {
    labels: ['Approved', 'In Progress', 'Fulfilled'],
    datasets: [{
      label: 'Market Purchase Status',
      data: [
        sourcingOrders.filter(o => o.marketPurchase === true && o.status === 'Approved').length,
        sourcingOrders.filter(o => o.marketPurchase === true && o.status === 'In Progress').length,
        sourcingOrders.filter(o => o.marketPurchase === true && o.status === 'Fulfilled').length
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(16, 185, 129, 0.7)'
      ],
      borderWidth: 1
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
    },
    onClick: (event, activeElements, chart) => {
      // This will be overridden per chart
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 20 } }
    },
    onClick: (event, activeElements, chart) => {
      // This will be overridden per chart
    }
  };

  return (
    <div>
      <h2 className="mb-4 fw-bold">Home Overview</h2>
      
      {/* Web Order KPIs */}
      <h4 className="mt-3 mb-3 fw-bold text-primary">
        <i className="bi bi-cart-check me-2"></i>Web Order Metrics
      </h4>
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
              <div className="kpi-title">Avg. Fulfilment Time</div>
              <div className="kpi-value">{kpis.avgTime} Days</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sourcing (TO/PO) KPIs */}
      <h4 className="mt-4 mb-3 fw-bold text-success">
        <i className="bi bi-truck me-2"></i>Sourcing (TO/PO) Metrics
      </h4>
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={4} xl={3}>
          <Card className="kpi-card clickable-card h-100" onClick={() => handleCardClick('sourcing')}>
            <Card.Body>
              <div className="kpi-title">
                Total Sourcing Docs
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
      
      {/* Web Order Charts */}
      <h4 className="mt-4 mb-3 fw-bold">Web Order Analytics</h4>
      <Row className="g-3 mb-4">
        <Col xs={12} lg={6}>
          <Card className="chart-container clickable-card h-100" style={{ cursor: 'pointer' }}>
            <Card.Body>
              <h5 className="fw-bold mb-3">
                Pending Order Ageing
                <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
              </h5>
              <div className="chart-wrapper" style={{ height: '320px' }}>
                <Bar 
                  data={ageingData} 
                  options={{
                    ...chartOptions,
                    onClick: (event, activeElements, chart) => handleChartClick(event, chart, 'ageing')
                  }} 
                />
              </div>
              <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: '0.75rem' }}>Click bars to filter by age range</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="chart-container clickable-card h-100" style={{ cursor: 'pointer' }}>
            <Card.Body>
              <h5 className="fw-bold mb-3">
                Source Contribution
                <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
              </h5>
              <div className="chart-wrapper d-flex justify-content-center" style={{ height: '320px' }}>
                <Doughnut 
                  data={sourceData} 
                  options={{
                    ...doughnutOptions,
                    onClick: (event, activeElements, chart) => handleChartClick(event, chart, 'source')
                  }} 
                />
              </div>
              <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: '0.75rem' }}>Click segments to filter by source</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sourcing Charts */}
      <h4 className="mt-4 mb-3 fw-bold">Sourcing Analytics</h4>
      <Row className="g-3">
        <Col xs={12} lg={6}>
          <Card className="chart-container clickable-card h-100" style={{ cursor: 'pointer' }}>
            <Card.Body>
              <h5 className="fw-bold mb-3">
                Fulfillment Source Distribution
                <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
              </h5>
              <div className="chart-wrapper d-flex justify-content-center" style={{ height: '320px' }}>
                <Doughnut 
                  data={sourcingRatioData} 
                  options={{
                    ...doughnutOptions,
                    onClick: (event, activeElements, chart) => handleChartClick(event, chart, 'sourcingRatio')
                  }} 
                />
              </div>
              <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: '0.75rem' }}>Click segments to filter by type</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="chart-container clickable-card h-100" style={{ cursor: 'pointer' }}>
            <Card.Body>
              <h5 className="fw-bold mb-3">
                Sourcing Status Distribution
                <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
              </h5>
              <div className="chart-wrapper" style={{ height: '320px' }}>
                <Bar 
                  data={sourcingStatusData} 
                  options={{
                    ...chartOptions,
                    onClick: (event, activeElements, chart) => handleChartClick(event, chart, 'sourcingStatus')
                  }} 
                />
              </div>
              <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: '0.75rem' }}>Click bars to filter by status</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="chart-container clickable-card h-100" style={{ cursor: 'pointer' }}>
            <Card.Body>
              <h5 className="fw-bold mb-3">
                Market Purchase Status
                <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
              </h5>
              <div className="chart-wrapper" style={{ height: '320px' }}>
                <Bar 
                  data={marketPurchaseData} 
                  options={{
                    ...chartOptions,
                    onClick: (event, activeElements, chart) => handleChartClick(event, chart, 'marketPurchase')
                  }} 
                />
              </div>
              <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: '0.75rem' }}>Click bars to filter market purchases</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomeOverview;
