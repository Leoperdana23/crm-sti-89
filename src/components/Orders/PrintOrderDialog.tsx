
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  delivery_method: string;
  expedisi?: string;
  notes?: string;
  created_at: string;
  order_items?: Array<{
    id: string;
    product_name: string;
    quantity: number;
    product_price: number;
    subtotal: number;
  }>;
  reseller?: {
    name: string;
    phone: string;
  };
}

interface PrintOrderDialogProps {
  order: Order;
}

const PrintOrderDialog: React.FC<PrintOrderDialogProps> = ({ order }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const orderDate = new Date(order.created_at).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk Pesanan #${order.id.slice(-8)}</title>
          <meta charset="utf-8">
          <style>
            @page {
              size: 80mm auto;
              margin: 5mm;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              margin: 0;
              padding: 10px;
              width: 70mm;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .company-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .order-info {
              margin-bottom: 10px;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            .item-header {
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
              margin-bottom: 5px;
              font-weight: bold;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
              font-size: 11px;
            }
            .item-name {
              flex: 1;
              margin-right: 10px;
            }
            .item-qty {
              text-align: center;
              width: 30px;
            }
            .item-price {
              text-align: right;
              width: 60px;
            }
            .total-section {
              border-top: 1px dashed #000;
              padding-top: 10px;
              margin-top: 10px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .grand-total {
              font-weight: bold;
              font-size: 14px;
              border-top: 1px solid #000;
              padding-top: 5px;
              margin-top: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 15px;
              border-top: 1px dashed #000;
              padding-top: 10px;
              font-size: 10px;
            }
            .status {
              text-align: center;
              margin: 10px 0;
              padding: 5px;
              border: 1px solid #000;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">SEDEKAT STORE</div>
            <div>Jl. Contoh No. 123</div>
            <div>Telp: 0721-123456</div>
          </div>

          <div class="order-info">
            <div><strong>No. Pesanan:</strong> #${order.id.slice(-8)}</div>
            <div><strong>Tanggal:</strong> ${orderDate}</div>
            <div><strong>Pelanggan:</strong> ${order.customer_name}</div>
            <div><strong>Telepon:</strong> ${order.customer_phone}</div>
            ${order.reseller ? `<div><strong>Reseller:</strong> ${order.reseller.name}</div>` : ''}
            <div><strong>Pengiriman:</strong> ${order.delivery_method === 'pickup' ? 'Diambil' : 'Dikirim'}</div>
            ${order.expedisi ? `<div><strong>Expedisi:</strong> ${order.expedisi}</div>` : ''}
          </div>

          <div class="status">
            STATUS: ${order.status.toUpperCase()}
          </div>

          <div class="item-header">
            <div style="display: flex; justify-content: space-between;">
              <span>Item</span>
              <span>Qty</span>
              <span>Harga</span>
            </div>
          </div>

          ${order.order_items?.map(item => `
            <div class="item-row">
              <div class="item-name">${item.product_name}</div>
              <div class="item-qty">${item.quantity}</div>
              <div class="item-price">${formatCurrency(item.subtotal)}</div>
            </div>
            <div style="font-size: 10px; color: #666; margin-bottom: 5px;">
              @ ${formatCurrency(item.product_price)} x ${item.quantity}
            </div>
          `).join('') || ''}

          <div class="total-section">
            <div class="total-row grand-total">
              <span>TOTAL BAYAR:</span>
              <span>${formatCurrency(order.total_amount)}</span>
            </div>
          </div>

          ${order.notes ? `
            <div style="margin-top: 10px; border-top: 1px dashed #000; padding-top: 10px;">
              <strong>Catatan:</strong><br>
              ${order.notes}
            </div>
          ` : ''}

          <div class="footer">
            <div>Terima kasih atas pesanan Anda!</div>
            <div>Simpan struk ini sebagai bukti</div>
            <div style="margin-top: 10px;">
              Dicetak: ${new Date().toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Cetak Struk
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cetak Struk Pesanan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Detail Pesanan</h4>
            <div className="space-y-1 text-sm">
              <div>No. Pesanan: #{order.id.slice(-8)}</div>
              <div>Pelanggan: {order.customer_name}</div>
              <div>Total: {formatCurrency(order.total_amount)}</div>
              <div>Status: {order.status}</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Cetak Struk
            </Button>
          </div>
          
          <div className="text-xs text-gray-500">
            * Pastikan printer thermal sudah siap
            * Format struk: 80mm width
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintOrderDialog;
