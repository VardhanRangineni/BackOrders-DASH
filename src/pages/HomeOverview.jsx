import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { dateDiffInDays, dateDiffInHours } from '../utils/utils';

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
        // Navigate to Web Order Backlog filtered by Approved
        setWebOrderFilters({ statusFilter: 'Approved' });
        onNavigate('web-order');
        break;
      
      case 'partial':
        // Navigate to Web Order Backlog filtered by Partially Fulfilled
        setWebOrderFilters({ statusFilter: 'Partially Fulfilled' });
        onNavigate('web-order');
        break;
      
      case 'completed':
        // Navigate to Web Order Backlog filtered by Fulfilled
        setWebOrderFilters({ statusFilter: 'Fulfilled' });
        onNavigate('web-order');
        break;
      
      case 'exception':
        // Navigate to Web Order Backlog filtered by Exception/Rejected
        setWebOrderFilters({ statusFilter: 'Exception' });
        onNavigate('web-order');
        break;
      
      case 'sourcing':
        // Navigate to Sourcing View with no filters (show all)
        setSourcingFilters({});
        onNavigate('sourcing');
        break;
      
      case 'pendingTO':
        // Navigate to Sourcing View filtered by pending statuses
        setSourcingFilters({ statusFilter: 'Generated' });
        onNavigate('sourcing');
        break;
      
      case 'fulfilledTO':
        // Navigate to Sourcing View filtered by Fulfilled
        setSourcingFilters({ statusFilter: 'Received' });
        onNavigate('sourcing');
        break;
      
      case 'rejectedTO':
        // Navigate to Sourcing View filtered by Rejected
        setSourcingFilters({ statusFilter: 'Rejected' });
        onNavigate('sourcing');
        break;
      
      case 'retry':
        // Navigate to Sourcing View filtered by retry > 0
        setSourcingFilters({ showRetryOnly: true });
        onNavigate('sourcing');
        break;
      
      case 'marketPurchase':
        // Navigate to Sourcing View filtered by Market Purchase
        setSourcingFilters({ marketPurchaseOnly: true });
        onNavigate('sourcing');
        break;
      
      case 'marketPurchaseFulfilled':
        // Navigate to Sourcing View filtered by Market Purchase Fulfilled
        setSourcingFilters({ marketPurchaseOnly: true, statusFilter: 'Received' });
        onNavigate('sourcing');
        break;
      
      case 'marketPurchasePending':
        // Navigate to Sourcing View filtered by Market Purchase Pending
        setSourcingFilters({ marketPurchaseOnly: true, statusFilter: 'Generated' });
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
          // Navigate to Web Order Backlog with Approved filter
          setWebOrderFilters({ statusFilter: 'Approved' });
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
          const statuses = ['Generated', 'Dispatched', 'In transit', 'Received'];
          setSourcingFilters({ statusFilter: statuses[clickedIndex] });
          onNavigate('sourcing');
          break;
          
        case 'marketPurchase':
          // Navigate to Sourcing View with market purchase and status filter
          const mpStatuses = ['Generated', 'Dispatched', 'Received'];
          setSourcingFilters({ marketPurchaseOnly: true, statusFilter: mpStatuses[clickedIndex] });
          onNavigate('sourcing');
          break;
          
        default:
          break;
      }
    }
  };

  const calculateKPIs = () => {
    // Web Order KPIs (using new status taxonomy: Approved, Partially Fulfilled, Fulfilled)
    const total = webOrders.length;
    const completed = webOrders.filter(o => (o.overallStatus || o.status) === 'Fulfilled');
    const fulfilledOrders = webOrders.filter(o => {
      const status = o.overallStatus || o.status;
      return status === 'Fulfilled' || status === 'Partially Fulfilled';
    });
    
    let totalDays = 0;
    completed.forEach(o => {
      const createdDate = new Date(o.created);
      const updatedDate = new Date(o.lastUpdated);
      totalDays += dateDiffInDays(createdDate, updatedDate);
    });

    // Sourcing Order KPIs (using new recordStatus: Draft Created, Partially Fulfilled, Fulfilled)
    const fulfilled = sourcingOrders.filter(o => (o.recordStatus || o.status) === 'Fulfilled');
    const fulfilledTOs = fulfilled.filter(o => o.type === 'TO');
    const fulfilledPOs = fulfilled.filter(o => o.type === 'PO');
    
    let totalHoursTO = 0;
    fulfilledTOs.forEach(o => { totalHoursTO += dateDiffInHours(o.created, o.lastUpdated); });
    
    let totalHoursPO = 0;
    fulfilledPOs.forEach(o => { totalHoursPO += dateDiffInHours(o.created, o.lastUpdated); });

    const retriedOrders = sourcingOrders.filter(o => o.retry > 0);
    const successfulRetries = retriedOrders.filter(o => (o.recordStatus || o.status) === 'Fulfilled');
    const retryRate = retriedOrders.length > 0 ? ((successfulRetries.length / retriedOrders.length) * 100).toFixed(0) : 0;

    // Market Purchase Analytics
    const marketPurchaseOrders = sourcingOrders.filter(o => o.type === 'Market Purchase' || o.marketPurchase === true);
    const marketPurchaseCount = marketPurchaseOrders.length;
    const marketPurchasePercentage = sourcingOrders.length > 0 ? ((marketPurchaseCount / sourcingOrders.length) * 100).toFixed(1) : 0;
    const marketPurchaseFulfilled = marketPurchaseOrders.filter(o => (o.recordStatus || o.status) === 'Fulfilled').length;
    const marketPurchasePending = marketPurchaseOrders.filter(o => {
      const status = o.recordStatus || o.status;
      return status !== 'Fulfilled' && status !== 'Rejected';
    }).length;

    return {
      // Web Order KPIs
      webOrders: {
        total,
        pending: webOrders.filter(o => (o.overallStatus || o.status) === 'Approved').length,
        partial: webOrders.filter(o => (o.overallStatus || o.status) === 'Partially Fulfilled').length,
        completed: completed.length,
        exception: webOrders.filter(o => {
          const status = o.overallStatus || o.status;
          return status === 'Exception' || status === 'Rejected';
        }).length,
        rate: total > 0 ? ((fulfilledOrders.length / total) * 100).toFixed(0) : 0,
        avgTime: completed.length > 0 ? (totalDays / completed.length).toFixed(1) : 0
      },
      // Sourcing Order KPIs
      sourcingOrders: {
        total: sourcingOrders.length,
        pending: sourcingOrders.filter(o => {
          const status = o.recordStatus || o.status;
          return status === 'Draft Created';
        }).length,
        fulfilled: fulfilled.length,
        rejected: sourcingOrders.filter(o => {
          const status = o.recordStatus || o.status;
          return status === 'Rejected' || status === 'Cancelled';
        }).length,
        avgTimeTo: fulfilledTOs.length > 0 ? (totalHoursTO / fulfilledTOs.length).toFixed(1) : 0,
        avgTimePo: fulfilledPOs.length > 0 ? (totalHoursPO / fulfilledPOs.length).toFixed(1) : 0,
        retryRate,
        marketPurchaseCount,
        marketPurchasePercentage,
        marketPurchaseFulfilled,
        marketPurchasePending
      }
    };
  };

  const kpis = calculateKPIs();

  // Ageing Chart Data
  const pendingOrders = webOrders.filter(o => {
    const status = o.overallStatus || o.status;
    return status === 'Approved' || status === 'Partially Fulfilled';
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
    labels: ['Store (TO)', 'Distributor (PO)', 'Market/Other'],
    datasets: [{
      data: [
        webOrders.filter(o => {
          if (o.items) {
            return o.items.some(item => item.sourceType === 'Store' || (item.source && (item.source.includes('S-') || item.source.includes('Store'))));
          }
          return o.source && (o.source.includes('S-') || o.source.includes('Store'));
        }).length,
        webOrders.filter(o => {
          if (o.items) {
            return o.items.some(item => item.sourceType === 'Distributor' || (item.source && item.source.includes('DIST')));
          }
          return o.source && o.source.includes('DIST');
        }).length,
        webOrders.filter(o => {
          if (o.items) {
            return o.items.some(item => !item.sourceType || item.sourceType === null || item.source === '' || item.source === 'Market');
          }
          return !o.source || o.source === '' || o.source === 'Market';
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
        sourcingOrders.filter(o => o.type === 'Market Purchase' || o.marketPurchase === true).length
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)', 
        'rgba(139, 92, 246, 0.7)', 
        'rgba(245, 158, 11, 0.7)'
      ],
      hoverOffset: 4
    }]
  };

  // Sourcing Status Data (using new TO/PO Status values)
  const sourcingStatusData = {
    labels: ['Generated', 'Dispatched', 'In transit', 'Received'],
    datasets: [{
      label: 'TO/PO Status',
      data: [
        sourcingOrders.filter(o => (o.status || o.trackingStatus) === 'Generated').length,
        sourcingOrders.filter(o => (o.status || o.trackingStatus) === 'Dispatched').length,
        sourcingOrders.filter(o => (o.status || o.trackingStatus) === 'In transit').length,
        sourcingOrders.filter(o => (o.status || o.trackingStatus) === 'Received').length
      ],
      backgroundColor: [
        'rgba(156, 163, 175, 0.7)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)'
      ],
      borderWidth: 1
    }]
  };

  // Record Status Data (Draft Created, Partially Fulfilled, Fulfilled)
  const recordStatusData = {
    labels: ['Draft Created', 'Partially Fulfilled', 'Fulfilled'],
    datasets: [{
      label: 'Record Status',
      data: [
        sourcingOrders.filter(o => (o.recordStatus || o.status) === 'Draft Created').length,
        sourcingOrders.filter(o => (o.recordStatus || o.status) === 'Partially Fulfilled').length,
        sourcingOrders.filter(o => (o.recordStatus || o.status) === 'Fulfilled').length
      ],
      backgroundColor: [
        'rgba(156, 163, 175, 0.7)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)'
      ],
      borderWidth: 1
    }]
  };

  // Market Purchase Data
  const marketPurchaseData = {
    labels: ['Generated', 'In transit', 'Received'],
    datasets: [{
      label: 'Market Purchase Status',
      data: [
        sourcingOrders.filter(o => (o.type === 'Market Purchase' || o.marketPurchase === true) && (o.status || o.trackingStatus) === 'Generated').length,
        sourcingOrders.filter(o => (o.type === 'Market Purchase' || o.marketPurchase === true) && (o.status || o.trackingStatus) === 'In transit').length,
        sourcingOrders.filter(o => (o.type === 'Market Purchase' || o.marketPurchase === true) && (o.status || o.trackingStatus) === 'Received').length
      ],
      backgroundColor: [
        'rgba(245, 158, 11, 0.7)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)'
      ],
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'bottom',
        onClick: (e, legendItem, legend) => {
          const index = legendItem.index;
          const chart = legend.chart;
          const meta = chart.getDatasetMeta(0);
          
          // Toggle visibility
          meta.data[index].hidden = !meta.data[index].hidden;
          chart.update();
        },
        labels: {
          padding: 15,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const meta = chart.getDatasetMeta(0);
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const hidden = meta.data[i] ? meta.data[i].hidden : false;
                return {
                  text: `${label}: ${value}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: hidden,
                  index: i,
                  lineWidth: hidden ? 0 : 1
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
    // Note: onClick will be added per chart in the chart component directly
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        onClick: (e, legendItem, legend) => {
          const index = legendItem.index;
          const chart = legend.chart;
          const meta = chart.getDatasetMeta(0);
          
          // Toggle visibility
          meta.data[index].hidden = !meta.data[index].hidden;
          chart.update();
        },
        labels: { 
          padding: 20,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const meta = chart.getDatasetMeta(0);
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const hidden = meta.data[i] ? meta.data[i].hidden : false;
                return {
                  text: `${label}: ${value}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: hidden,
                  index: i,
                  lineWidth: hidden ? 0 : 1
                };
              });
            }
            return [];
          }
        } 
      },
      tooltip: {
        enabled: true
      }
    }
    // Note: onClick will be added per chart in the chart component directly
  };

  return (
    <div>
      <h2 className="mb-4 fw-bold">Dashboard Overview</h2>
      
      {/* ========== WEB ORDER BACKLOG KPIs ========== */}
      <div className="mb-5">
        <h4 className="mt-3 mb-3 fw-bold text-primary border-bottom pb-2">
          <i className="bi bi-cart-check me-2"></i>Web Order Backlog Metrics
        </h4>
        <Row className="g-3 mb-3">
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card clickable-card h-100" onClick={() => handleCardClick('total')}>
              <Card.Body>
                <div className="kpi-title">
                  Total Back Orders
                  <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
                </div>
                <div className="kpi-value">{kpis.webOrders.total}</div>
                <div className="kpi-subtitle">All back orders</div>
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
                <div className="kpi-value text-warning">{kpis.webOrders.pending}</div>
                <div className="kpi-subtitle">Awaiting sourcing</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card clickable-card h-100" onClick={() => handleCardClick('partial')}>
              <Card.Body>
                <div className="kpi-title">
                  Partially Fulfilled Orders
                  <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
                </div>
                <div className="kpi-value text-info">{kpis.webOrders.partial}</div>
                <div className="kpi-subtitle">In progress</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card clickable-card h-100" onClick={() => handleCardClick('completed')}>
              <Card.Body>
                <div className="kpi-title">
                  Fulfilled Orders
                  <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
                </div>
                <div className="kpi-value text-success">{kpis.webOrders.completed}</div>
                <div className="kpi-subtitle">Fully fulfilled</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card clickable-card h-100" onClick={() => handleCardClick('exception')}>
              <Card.Body>
                <div className="kpi-title">
                  Rejected / Exception Orders
                  <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
                </div>
                <div className="kpi-value text-danger">{kpis.webOrders.exception}</div>
                <div className="kpi-subtitle">Requires attention</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Fulfillment Rate</div>
                <div className="kpi-value text-success">{kpis.webOrders.rate}%</div>
                <div className="kpi-subtitle">Success rate</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Avg. Fulfillment Time</div>
                <div className="kpi-value">{kpis.webOrders.avgTime}</div>
                <div className="kpi-subtitle">Days to complete</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* ========== TO/PO TRACKING KPIs ========== */}
      <div className="mb-5">
        <h4 className="mt-4 mb-3 fw-bold text-success border-bottom pb-2">
          <i className="bi bi-truck me-2"></i>TO/PO Tracking Metrics
        </h4>
        <Row className="g-3 mb-3">
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card clickable-card h-100" onClick={() => handleCardClick('sourcing')}>
              <Card.Body>
                <div className="kpi-title">
                  Total TO/PO Documents
                  <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
                </div>
                <div className="kpi-value">{kpis.sourcingOrders.total}</div>
                <div className="kpi-subtitle">All sourcing docs</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card clickable-card h-100" onClick={() => handleCardClick('pendingTO')}>
              <Card.Body>
                <div className="kpi-title">
                  Pending TO/PO
                  <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
                </div>
                <div className="kpi-value text-warning">{kpis.sourcingOrders.pending}</div>
                <div className="kpi-subtitle">In progress</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card clickable-card h-100" onClick={() => handleCardClick('fulfilledTO')}>
              <Card.Body>
                <div className="kpi-title">
                  Fulfilled TO/PO
                  <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
                </div>
                <div className="kpi-value text-success">{kpis.sourcingOrders.fulfilled}</div>
                <div className="kpi-subtitle">Completed docs</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card clickable-card h-100" onClick={() => handleCardClick('rejectedTO')}>
              <Card.Body>
                <div className="kpi-title">
                  Rejected / Cancelled
                  <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
                </div>
                <div className="kpi-value text-danger">{kpis.sourcingOrders.rejected}</div>
                <div className="kpi-subtitle">Failed docs</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Avg. TO Fulfillment</div>
                <div className="kpi-value">{kpis.sourcingOrders.avgTimeTo}</div>
                <div className="kpi-subtitle">Hours (Store)</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Avg. PO Fulfillment</div>
                <div className="kpi-value">{kpis.sourcingOrders.avgTimePo}</div>
                <div className="kpi-subtitle">Hours (Distributor)</div>
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
                <div className="kpi-value text-primary">{kpis.sourcingOrders.retryRate}%</div>
                <div className="kpi-subtitle">Recheck success</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* ========== MARKET PURCHASE KPIs ========== */}
      <div className="mb-5">
        <h4 className="mt-4 mb-3 fw-bold text-warning border-bottom pb-2">
          <i className="bi bi-cart-plus me-2"></i>Market Purchase Metrics
        </h4>
        <Row className="g-3 mb-3">
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card clickable-card h-100" onClick={() => handleCardClick('marketPurchase')}>
              <Card.Body>
                <div className="kpi-title">
                  Total Market Purchases
                  <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
                </div>
                <div className="kpi-value">{kpis.sourcingOrders.marketPurchaseCount}</div>
                <div className="kpi-subtitle">External sourcing</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card h-100">
              <Card.Body>
                <div className="kpi-title">Market Purchase %</div>
                <div className="kpi-value text-warning">{kpis.sourcingOrders.marketPurchasePercentage}%</div>
                <div className="kpi-subtitle">Of all sourcing</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card clickable-card h-100" onClick={() => handleCardClick('marketPurchaseFulfilled')}>
              <Card.Body>
                <div className="kpi-title">
                  MP Fulfilled
                  <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
                </div>
                <div className="kpi-value text-success">{kpis.sourcingOrders.marketPurchaseFulfilled}</div>
                <div className="kpi-subtitle">Completed</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} lg={4} xl={3}>
            <Card className="kpi-card clickable-card h-100" onClick={() => handleCardClick('marketPurchasePending')}>
              <Card.Body>
                <div className="kpi-title">
                  MP Pending
                  <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
                </div>
                <div className="kpi-value text-info">{kpis.sourcingOrders.marketPurchasePending}</div>
                <div className="kpi-subtitle">In progress</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* ========== ANALYTICS CHARTS ========== */}
      <h4 className="mt-5 mb-3 fw-bold text-secondary border-bottom pb-2">
        <i className="bi bi-graph-up me-2"></i>Analytics & Insights
      </h4>
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
                TO/PO Status Distribution
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
              <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: '0.75rem' }}>Click bars to filter by TO/PO status</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="g-3 mt-2">
        <Col xs={12} lg={6}>
          <Card className="chart-container clickable-card h-100" style={{ cursor: 'pointer' }}>
            <Card.Body>
              <h5 className="fw-bold mb-3">
                Record Status Distribution
                <i className="bi bi-box-arrow-up-right ms-2 text-muted" style={{ fontSize: '0.875rem' }}></i>
              </h5>
              <div className="chart-wrapper" style={{ height: '320px' }}>
                <Bar 
                  data={recordStatusData} 
                  options={{
                    ...chartOptions,
                    onClick: (event, activeElements, chart) => handleChartClick(event, chart, 'recordStatus')
                  }} 
                />
              </div>
              <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: '0.75rem' }}>Draft, Partial & Fulfilled records</p>
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
