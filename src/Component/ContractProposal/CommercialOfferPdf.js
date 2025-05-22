import React from 'react';
import './CommercialOffer.css';

const CommercialOfferPdf = ({ data }) => {
  return (
    <div className="pdf-content">
      {/* Page 1 */}
      <div className="page">
        <div className="header">
          <div className="ref-info">
            Ref #: {data.refNumber}<br />
            Date - {data.date}<br />
            Form No {data.formNumber}<br />
            Opportunity Number : {data.opportunityNumbers.join(', ')}
          </div>
          <div className="hospital-address">
            {data.hospital.name}<br />
            {data.hospital.address}
          </div>
        </div>

        <div className="subject">
          Subject: Your requirement of Corrugated Silicon Tube 22mm 90cm, SKANSIESTA-PRO -EF
        </div>

        <div class="content">
          <p>Dear Sir/ Madam,</p>

          <p>
            Thank you for your interest in Skanray's products. We are confident that
            our products will satisfy your clinical requirements.
          </p>

          <p>
            In line with your requirements, we are pleased to herewith submit our
            offer for the following:
          </p>

          <ol>
            <li>Corrugated Silicon Tube 22mm 90cm</li>
            <li>SKANSIESTA-PRO -EF</li>
          </ol>

          <p>The offer document has the following enclosures</p>

          <div class="enclosures">
            <ol>
              <li>Product Brochure</li>
              <li>Commercial Offer</li>
              <li>Technical Specifications</li>
              <li>Scope of supply</li>
              <li>Terms and Conditions</li>
            </ol>
          </div>

          <p>
            We sincerely hope that this offer is in line with your requirements. For
            further clarifications and information, we will be glad to furnish you
            with the same.
          </p>

          <p>We look forward to your valued order and long term relationship.</p>

          <p>Assuring you of our best services at all times.</p>
        </div>

        <div class="signature">
          <p>
            Yours truly,<br />
            Skanray Technologies Limited
          </p>

          <p>
            Sony Ponnanna_ Sales<br />
            Sales Engineer
          </p>
        </div>

        <div class="footer">
          *This is an electronically generated quotation, no signature required.
        </div>

        <div class="page-number">Page 1 of 9</div>

      </div>

      {/* Page 2 */}
      <div className="page">
        <div className="header">
          <div className="ref-info">
            Ref #: {data.refNumber}<br />
            Date - {data.date}<br />
            Form No {data.formNumber}<br />
            Opportunity Number : {data.opportunityNumbers.join(', ')}
          </div>
        </div>

        <div className="section-title">Contact</div>
        <p>
          {data.contact.name}<br />
          {data.contact.phone}<br />
          {data.contact.email}
        </p>
        <p>For further details on our local sales and services offices please visit our website<br />
          www.skanray.com</p>
        <p>You may also call our Toll Free Customer Interaction Centre on 1800-425-7002 between 10AM to 6:45PM on all weekdays or email your queries to cic@skanray.com</p>

        <div class="page-number">
          Page 2 of 9<br />
          Skanray Technologies Limited, Regd. Office: Plot #15-17, Hebbal Industrial Area, Mysuru - 570016, INDIA. P +91 8212415559 CIN U72206KA2007PLC041774<br />
          Healthcare Division: #360, KIADB Industrial Area, Hebbal, Mysuru - 570018, INDIA. P +91 8212407000 E office@skanray.com W www.skanray.com
        </div>

      </div>

      <div className="page">
        <div class="header">
          <div class="ref-info">
            Ref #: SK-09387 Rev-0<br />
            Date - 30/04/2025<br />
            Form No 3F5004 Rev#2.0<br />
            Opportunity Number : SK-00642, SK-00641
          </div>
        </div>

        <div class="section-title">Commercial Offer (All values in Rs)</div>

        <table>
          <thead>
            <tr>
              <th>Sno</th>
              <th>Material Part #</th>
              <th>Material Description</th>
              <th>Unit Price</th>
              <th>Warranty (Months)</th>
              <th>Qty</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>F3-75-380-0108-43</td>
              <td>Corrugated Silicon Tube 22mm 90cm</td>
              <td>2,451</td>
              <td>12</td>
              <td>1</td>
              <td>2,451</td>
            </tr>
            <tr>
              <td>2</td>
              <td>F3-75-390-0381-21</td>
              <td>SKANSIESTA-PRO -EF</td>
              <td>12,45,707</td>
              <td>12</td>
              <td>1</td>
              <td>12,45,707</td>
            </tr>
            <tr>
              <td colspan="6">Sub-total (Ex-works Mysore)</td>
              <td>12,48,158</td>
            </tr>
            <tr>
              <td colspan="6">Discount</td>
              <td>-0</td>
            </tr>
            <tr>
              <td colspan="6">Total (Ex-works Mysore)</td>
              <td>12,48,158</td>
            </tr>
            <tr>
              <td colspan="6">Add Freight & Insurance</td>
              <td>49,877</td>
            </tr>
            <tr>
              <td colspan="6">Add GST</td>
              <td>1,55,764</td>
            </tr>
            <tr>
              <td colspan="6">Total Price – F.O.R Destination in Indian Rupee</td>
              <td>14,53,800</td>
            </tr>
            <tr>
              <td colspan="7">Total Price in words – Indian Rupee Fourteen Lakh Fifty Three Thousand Eight Hundred Only</td>
            </tr>
          </tbody>
        </table>

        <div class="note">
          <p><strong>Note:</strong></p>
          <ol>
            <li>Effective from 1st Oct 2020, as per Govt Of India Notification TCS (Tax collection at Source) will be charged if applicable at the rate of 0.1% if PAN / Aadhaar is submitted otherwise 1%.</li>
            <li>The above prices are in Indian Rupee. & inclusive of currently applicable GST. Any change in these rates at the time of billing, will be extra to your account, at actual.</li>
            <li>All the orders should be placed on M/s Skanray Technologies Limited., Mysore for supply of goods</li>
            <li>Payment terms: 100% advance along with confirmed order.</li>
            <li>Validity: 30 days from the date of offer.</li>
            <li>Other Terms & Conditions, as per enclosed Terms & Conditions of Sale (Supply only)</li>
          </ol>
        </div>

        <div class="section-title">Payment Details</div>
        <p>Bank Name:<br />
          Branch: MID Corporate Branch<br />
          A/C Name: Skanray Technologies Limited<br />
          A/C no: 125001910215<br />
          IFSC Code:</p>

        <div class="company-info">
          Skanray Technologies Limited, Regd. Office: Plot #15-17, Hebbal Industrial Area, Mysuru - 570016, INDIA. P +91 8212415559 CIN U72206KA2007PLC041774<br />
          Healthcare Division: #360, KIADB Industrial Area, Hebbal, Mysuru - 570018, INDIA. P +91 8212407000 E office@skanray.com W www.skanray.com
        </div>

        <div class="page-number">
          Page 3 of 9
        </div>
      </div>
      <div className="page">
        <div class="header">
          <div class="ref-info">
            Ref #: SK-09387 Rev-0<br />
            Date - 30/04/2025<br />
            Form No 3F5004 Rev#2.0<br />
            Opportunity Number : SK-00642, SK-00641
          </div>
        </div>

        <p>1. F3-75-380-0108-43 - Corrugated Silicon Tube 22mm 90cm</p>

        <div class="section-title">Technical Specifications</div>

        <div class="note">
          <p><strong>Note:</strong></p>
          <p>Main Unit 1 Year, Accessories 6 months, Disposable/Consumable No Warranty</p>
        </div>

        <p>2. F3-75-390-0381-21 - SKANSIESTA-PRO -EF</p>

        <div class="section-title">Technical Specifications</div>

        <p>General Specifications: Adult & Pediatric anesthesia workstation 3 Gas pipeline connectivity 3 Cylinder mounting (O2, O2 & N20) Electronic flowmeter with anti-hypoxia device 25 - 75 l/min oxygen flush CGO changeover switch built 3 litre oxygen reservoir Dual Selectatec vaporiser mount Mechanical Pressure relief valve for CGO Electronic O2 failure alarm Pneumatic O2 failure indicator Auxiliary O2 flow-meter-50lpm Movable trolley with 3 storage drawers Table lighting with brightness control 10.4" Colour LCD display with touch screen Power input 100 - 240 VAC 50/60 Hz 2 Hours battery backup Safety Mechanical Pressure relief valve for ventilator</p>

        <div class="section-title">Scope of Supply</div>

        <p>1 EA - SKANSIESTA Main Unit 1 EA - O2 Hose Assembly 1 EA - N20 Hose Assembly 1 EA - Air Hose Assembly 1 EA - Power Cord 1 EA - Circle absorber system 1 EA - Conical Oxygen Connector 1 EA - Cylinder spanner 6 EA - Bodak seals 1 EA - 10mm Allen Key 1 EA - Oxygen Sensor 1 EA - Operating Manual 1 EA - Bain circuit 1 EA - Pediatric circuit 1 EA - Rebreathing Circuit Adult 1 EA - Corrugated Tube for Breathing Bag 1 EA - 22M-22M Connector</p>

        <div class="note">
          <p><strong>Note:</strong></p>
          <p>Main Unit 1 Year, Accessories 6 months, Disposable/Consumable No Warranty</p>
        </div>

        <div class="page-number">
          Page 4 of 9
        </div>
      </div>
      <div className="page">
        <div class="header">
          <div class="ref-info">
            Ref #: SK-00307 Rev-0<br />
            Date - 30/04/2025<br />
            Form No 3F5004 Rev#2.0<br />
            Opportunity Number : SK-00642, SK-00641
          </div>
        </div>

        <div class="section-title">Terms and Conditions</div>

        <div class="section-title">Terms & Conditions of Sale (Supply only)</div>

        <p>Unless otherwise stated in the quotation</p>

        <div class="section-title">PRICE:</div>

        <p>Prices quoted are for supply, on FOR destination basis, inclusive of currently applicable GST. Any variation in the above referred taxes will be to your account.</p>

        <p>Any entry permit / Way bill / such statutory local permissions, if required, have to be provided to us by your Institution, prior to dispatch of Goods from our factory at Mysore.</p>

        <p>The prices do not include unloading charges at the site and demurrage charges, if any.</p>

        <div class="section-title">VALIDITY:</div>

        <p>The offer shall be valid for your acceptance for a period of thirty days from the date of quotation and thereafter subject to supplier's confirmation. Offer would be considered as accepted on receipt, by the supplier, of technically and commercially clear order along with the dispatch instructions in writing.</p>

        <div class="section-title">SCOPE:</div>

        <p>The scope of supply and other terms and conditions of this contract shall be strictly governed by supplier's offer and supplier's acknowledgement of purchaser's order. The purchaser shall be deemed to have understood and accepted the conditions contained herein and the specific terms and conditions contained in the offer.</p>

        <div class="section-title">PAYMENT TERMS:</div>

        <p>90% of the order value as advance payment, along with the confirmed order. Balance 10% of the order value (together with taxes and duties, if applicable), will be payable against submission of proof of despatch. The documents that will be submitted to you or your bankers upon your instruction will be the Sale Invoice and copy of the Lorry / transporter's receipt, evidencing the movement. Please provide the full address of your bankers in your order. Please provide us your banker's confirmation letter, with regard to the balance payment along with your despatch clearance.</p>

        <div class="page-number">
          Page 5 of 9<br />
          Skanray Technologies Limited, Regd. Office: Plot #15-17, Hebbal Industrial Area, Mysuru - 570016, INDIA. P +91 8212415559 CIN U72206KA2007PLC041774<br />
          Healthcare Division: #360, KIADB Industrial Area, Hebbal, Mysuru - 570018, INDIA. P +91 8212407000 E office@skanray.com W www.skanray.com
        </div>
      </div>
      <div className='page'>
        <div class="header">
          <div class="ref-info">
            Ref #: SK-09387 Rev-0<br />
            Date : 30/04/2025<br />
            Form No 3F5004 Rev#2.0<br />
            Opportunity Number : SK-00642, SK-00641
          </div>
        </div>

        <p>The purchaser shall make payments as per the agreed terms of payment. If for any reason payment is not forthcoming within the agreed time, supplier, on his own discretion without giving intimation to the purchaser, can call back the consignment and adjust the costs incurred in the said transaction from the advances paid.</p>

        <p>Please ensure that payment is made on priority basis so that the transporter / truck deliver the material when it reaches purchasers site. Non clearance of the payment and non handing over of the consignee copy of LR on time, can not only involve additional loading and unloading but will also cost purchaser, storage charges as well as the to and fro freight, to the nearest transit warehouse, of the transporter. This unnecessary loading and unloading is also not considered good for the sophisticated medical equipment.</p>

        <div class="section-title">DELIVERY:</div>

        <p>Shipment of most orders can normally be made, on FOR station of despatch basis, within 4 to 8 weeks from the date of receipt of technically and commercially clear order along with despatch instructions / agreed advance amount etc., whichever is later.</p>

        <div class="section-title">INSTALLATION / ASSEMBLY - DEMONSTRATION:</div>

        <p>The purchaser shall provide a suitable site, carry out preliminaries connected with installation, civil and structural alterations (as per supplier's specifications) to enable to the supplier to install the equipment. Purchaser shall comply with requirement of Atomic Energy Regulatory Board (AERB) Guidelines for setting up of new diagnostic X-Ray installation.</p>

        <div class="section-title">OPERATIONAL REQUIREMENT:</div>

        <p>The Purchaser shall maintain the environmental conditions recommended by the supplier so as to ensure that the equipment does not suffer damage due to humidity, dust, pests, severe temperature etc. The purchaser shall ensure that the equipment is operated, as per the operating instructions and supplier's recommendations. The purchaser shall also ensure that competent, trained and skilled personnel operate the equipment. The supplier shall not be responsible for any loss, damage or injuries caused due to purchaser's non fulfillment of these conditions.</p>

        <div class="section-title">AERB GUIDELINES FOR INSTALLATION:</div>

        <p>The Atomic Energy Regulatory Board (AERB) Safety Code AERB/SC/MED-2 for Medical Diagnostic X-Ray Equipment and installations is applicable for all x-ray installations</p>

        <div class="section-title">PROCUREMENT APPROVAL:</div>

        <p>End user shall obtain "Permission for Procurement" from AERB through e-LORA web portal.</p>

        <div class="page-number">
          Page 6 of 9<br />
          Skanray Technologies Limited, Regd. Office: Plot #15-17, Hebbal Industrial Area, Mysuru - 570016, INDIA. P +91 8212415559 CIN U72206KA2007PLC041774<br />
          Healthcare Division: #360, KIADB Industrial Area, Hebbal, Mysuru - 570018, INDIA. P +91 8212407000 E office@skanray.com W www.skanray.com
        </div>

      </div>
      <div className='page'>
        <div class="header">
          <div class="ref-info">
            Ref #: SK-09387 Rev-0<br />
            Date : 30/04/2025<br />
            Form No 3F5004 Rev#2.0<br />
            Opportunity Number : SK-00642, SK-00641
          </div>
        </div>

        <p>Refer "guidelines document for user" under link below<br />
          https://elora.aerb.gov.in/ELORA/PDFs/Guidelines%20for%20users.pdf<br />
          No X-Ray machine shall be installed / commissioned unless the layout of the proposed X-Ray installation is approved by the competent authority. The application for approval shall be made by the person owning responsibility for the installation site.<br />
          As the above is mandatory for the installation and commissioning of the X-Ray equipment, the purchaser shall comply with the above requirement and get the room layout plan duly approved by the AERB through e-LORA web portal.</p>

        <div class="section-title">OPERATIONAL LICENSE:</div>

        <p>SKANRAY will perform the installation and On-site QA tests. Purchaser shall obtain license to operate within 3 months of completion of on-site QA tests<br />
          After completion of installation & On-site QA tests, end user shall obtain license to use the equipment from AERB through e-LORA web portal.<br />
          For further information, one can log on to<br />
          www.aerb.gov.in , https://elora.aerb.gov.in/ELORA/populatedLoginAction.htm</p>

        <div class="section-title">WARRANTY:</div>

        <p>All goods manufactured by us are guaranteed against defects arising from material or workmanship for a period of 12months from the date of installation or 13 months from the date of shipment, whichever is earlier. Our liability under this warranty is limited to either repairing the defective parts free of charge, or at our option, providing a free replacement, in exchange of the defective part. The defective part shall be sent, duly packed, to our concerned office/service station, at purchaser's cost including freight, insurance and forwarding charges. The warranty is applicable only if the equipment is used in the way prescribed by the supplier. No accidental damages to any part of the machine or its accessories will be covered under this warranty. Bought out items such as trolleys, stabilisers, cameras, any recording devices, monitor stands, cables are not tested by us prior to supply. Manufacturer's warranty shall apply for such items. This warranty shall not extend to glassware items & parts, which are subject to normal wear & tear. The warranty also does not cover breakages of any item due to misuse.<br />
          X-ray tubes, FPD & Display monitor are subject to pro-rata warranty and these items going defective during the warranty period shall be replaced as per following replacements policy. (This is in line with warranty being extended to us by our suppliers of these parts)</p>

        <p>a) Price of the X-Ray Tube or FPD or HF X-Ray Generators = Rs. X<br />
          b) Un-expired portion of the warranty = Y Months<br />
          c) Pro-Rate Credit to be allowed to customer = X x Y<br />
          d) Replacement cost to be borne by customer = a) - c) = Rs._____</p>

        <p>The warranty, however does not extend to the following:<br />
          For X-Ray machines or Surgical C-Arm units: H.T cables and accessories.</p>

        <div class="page-number">
          Page 7 of 9
        </div>
      </div>
      <div className='page'>
        <div class="header">
          <div class="ref-info">
            Ref #: SK-09387 Rev-0<br />
            Date : 30/04/2025<br />
            Form No 3F5004 Rev#2.0<br />
            Opportunity Number : SK-00642, SK-00641
          </div>
        </div>

        <p>For Patient Monitoring systems: Probes / sensors, Pressure transducers, temperature probes, patient cables, batteries & other consumables</p>

        <p>For Ventillators / Anaesthesia systems: Flow transducer, pressure transducer, heater wires, O2 cells, patient tubes / bellows, batteries & other consumables.</p>

        <div class="section-title">Post Warranty Service:</div>

        <p>After completion of warranty period, the equipment can be covered by Annual Maintenance Contract (Labour only) @4% of the Purchase Order Value + service taxes or Comprehensive Annual Maintenance Contract @10% of the Purchase Order Value + service taxes or Service on Call Basis at Rs.20,000.00 + service taxes. The Comprehensive Annual Maintenance Contract covers labor and all parts excluding Image Intensifier, CCD Camera, X-Ray tube, H.T cables and accessories.</p>

        <div class="section-title">LIABILITIES:</div>

        <p>Except as otherwise provided explicitly hereinabove, we shall not be liable for any special or consequential damages of any kind or nature, arising out of use of this equipment. We shall also not be liable in any manner for use of or failure in the performance of other equipment, to which the equipment is attached or connected.</p>

        <div class="section-title">EXEMPTION:</div>

        <p>We shall not be responsible for any failure in performing our obligations, if such non performance is due to reasons beyond our control.</p>

        <div class="section-title">AGREEMENT:</div>

        <p>The foregoing terms & conditions shall prevail notwithstanding any variations contained in any document received from the customer, unless such variations have been specifically agreed upon in writing by Skanray Technologies Limited.</p>

        <div class="page-number">
          Page 8 of 9
        </div>
      </div>
      <div className='page'>
        <div class="header">
          <div class="ref-info">
            Ref #: SK-Q0307 Rev-0<br />
            Date - 30/04/2025<br />
            Form No 3F5004 Rev#2.0<br />
            Opportunity Number : SK-O0642, SK-O0641
          </div>
        </div>

        <div class="section-title">INVOICING:</div>

        <p>Invoicing can be raised through Skanray authorized stockist or distributor based on the availablity of the goods.<br />
          The undersigned hereby orders the afore-mentioned goods from Skanray Technologies Limited. The goods specified above to be delivered as per the conditions of sales and terms of business set out in this contract. Seller's terms of business as printed overleaf are considered to form part of contract unless expressly overruled by any of the conditions stipulated therein.</p>

        <div style={{ marginTop: "50px" }}>
          <div style={{ float: "left", width: "50%" }} >
            <p>Acceptance<br />
              Customer's signature<br />
              and seal</p>
          </div>
          <div style={{ float: "right", width: "50%" }}>
            <p>Accepted on behalf of Skanray Technologies</p>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>

        <div style={{ marginTop: "30px" }}>
          <div style={{ float: "left", width: "50%" }} >
            <p>Date:</p>
          </div>
          <div style={{ float: 'right', width: "50%" }}   >
            <p>Date:</p>
          </div>
          <div style={{ clear: "both" }}></div>
        </div>

        <div class="company-info">
          Skanray Technologies Limited, Regd. Office: Plot #15-17, Hebbal Industrial Area, Mysuru - 570016, INDIA. P +91 8212415559 CIN U72206KA2007PLC041774<br />
          Healthcare Division: #360, KIADB Industrial Area, Hebbal, Mysuru - 570018, INDIA. P +91 8212407000 E office@skanray.com W www.skanray.com
        </div>

        <div class="page-number">
          Page 9 of 9
        </div>
      </div>
    </div>
  );
};

export default CommercialOfferPdf;