// printService.js formats an order into a clean JSON structure
// ready to be consumed by a local print client, a browser print script, or a network printer.

exports.formatOrderForPrint = (order) => {
  const storeName = process.env.STORE_NAME || 'Pizzaria Bella Massa'; // From previous conversation context or default
  
  // Format Address or Table
  let locationInfo = '';
  if (order.type === 'LOCAL' && order.Table) {
    locationInfo = `Mesa: ${order.Table.number}`;
  } else if (order.type === 'DELIVERY' && order.Address) {
    locationInfo = `Endereço: ${order.Address.street}, ${order.Address.number} - ${order.Address.neighborhood}`;
    if (order.Address.complement) locationInfo += ` (${order.Address.complement})`;
  } else if (order.type === 'RETIRADA') {
    locationInfo = 'Retirada no balcão';
  }

  // Format Items
  const itemsFormatted = order.Items.map((item) => {
    let itemName = `${item.quantity}x ${item.Product.name}`;
    if (item.size) itemName += ` (${item.size})`;
    
    let adds = [];
    if (item.Additionals && item.Additionals.length > 0) {
      adds = item.Additionals.map(a => `  + ${a.price}`);
    }

    return {
      name: itemName,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      observation: item.observation || '',
      additionalsCount: item.Additionals?.length || 0,
    };
  });

  const payload = {
    header: {
      storeName,
      orderId: `#${order.id.toString().padStart(4, '0')}`,
      date: order.createdAt.toLocaleString('pt-BR'),
      type: order.type,
    },
    customer: {
      name: order.Customer ? order.Customer.name : 'Cliente Anônimo',
      phone: order.Customer ? order.Customer.phone : '',
      location: locationInfo,
    },
    items: itemsFormatted,
    payment: {
      method: order.paymentMethod || 'N/A',
      total: Number(order.total),
    }
  };

  return payload;
};
