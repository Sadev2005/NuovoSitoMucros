'use client'
// Force Cloudflare Pages rebuild - 2026-09-04 04:50 UTC
import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ThankYouContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const amount = searchParams.get('amount')

  useEffect(() => {
    // Fire Meta Pixel Purchase event
    if (window.fbq) {
      const purchaseAmount = amount ? (parseFloat(amount) / 100).toFixed(2) : '69.90'

      fbq('track', 'Purchase', {
        value: parseFloat(purchaseAmount),
        currency: 'EUR',
        content_name: 'Massaggiatore Piedi Elettrico Riscaldante',
        content_id: 'foot-massager-001',
        content_type: 'product',
        content_category: 'Wellness'
      })

      console.log('[Meta Pixel] Purchase tracked:', {
        value: purchaseAmount,
        sessionId: sessionId
      })
    }
  }, [amount, sessionId])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f5f0 0%, #fafaf8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        maxWidth: '600px',
        background: 'white',
        borderRadius: '12px',
        padding: '60px 40px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        textAlign: 'center'
      }}>
        {/* Success Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 30px',
          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '44px',
          color: 'white'
        }}>
          ✓
        </div>

        <h1 style={{
          fontSize: '32px',
          color: '#1a1a1a',
          margin: '0 0 16px 0',
          fontWeight: '600'
        }}>
          Ordine Confermato!
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#666',
          margin: '0 0 30px 0',
          lineHeight: '1.6'
        }}>
          Grazie per il tuo acquisto. Il tuo Massaggiatore Piedi Elettrico Riscaldante verrà preparato e spedito entro 48 ore.
        </p>

        {/* Order Details Card */}
        <div style={{
          background: '#f9f9f7',
          borderRadius: '8px',
          padding: '24px',
          margin: '30px 0',
          borderLeft: '4px solid #d4af37',
          textAlign: 'left'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ color: '#999', fontSize: '13px' }}>Numero Ordine</span>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', margin: '4px 0 0 0' }}>
              {sessionId || 'Elaborazione...'}
            </p>
          </div>
          <div>
            <span style={{ color: '#999', fontSize: '13px' }}>Importo Pagato</span>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#d4af37', margin: '4px 0 0 0' }}>
              €{amount ? (parseFloat(amount) / 100).toFixed(2) : '69,90'}
            </p>
          </div>
        </div>

        {/* Information */}
        <div style={{
          background: '#f0f8ff',
          borderRadius: '8px',
          padding: '20px',
          margin: '24px 0',
          fontSize: '14px',
          color: '#333',
          lineHeight: '1.8'
        }}>
          <p style={{ margin: '0 0 12px 0', fontWeight: '600' }}>📦 Cosa Succede Ora:</p>
          <ul style={{ margin: 0, paddingLeft: '20px', textAlign: 'left' }}>
            <li style={{ marginBottom: '8px' }}>Riceverai un'email di conferma a breve</li>
            <li style={{ marginBottom: '8px' }}>Il numero di tracking sarà inviato entro 24 ore</li>
            <li style={{ marginBottom: '8px' }}>Consegna garantita entro 14 giorni</li>
            <li>Garanzia 30 giorni: soddisfatto o completamente rimborsato</li>
          </ul>
        </div>

        {/* CTA Button */}
        <a href="/" style={{
          display: 'inline-block',
          marginTop: '32px',
          padding: '14px 36px',
          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: '600',
          fontSize: '16px',
          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}>
          Torna alla Home
        </a>

        {/* Trust Badges */}
        <div style={{
          marginTop: '40px',
          paddingTop: '24px',
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          fontSize: '12px',
          color: '#999',
          flexWrap: 'wrap'
        }}>
          <div>🔒 Pagamento Sicuro</div>
          <div>✓ Spedizione Tracciata</div>
          <div>↩️ Reso Gratuito</div>
        </div>
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: '#f5f5f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        color: '#666'
      }}>
        Elaborazione in corso...
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  )
}
