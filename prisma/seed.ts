import { db } from '../src/lib/db'

const categories = [
  { name: 'Textbooks & Notes', icon: 'book-open', color: '#16a34a', order: 0 },
  { name: 'Electronics', icon: 'smartphone', color: '#0891b2', order: 1 },
  { name: 'Accommodation', icon: 'home', color: '#7c3aed', order: 2 },
  { name: 'Clothing', icon: 'shirt', color: '#e11d48', order: 3 },
  { name: 'Transport', icon: 'car', color: '#ea580c', order: 4 },
  { name: 'Furniture', icon: 'armchair', color: '#ca8a04', order: 5 },
  { name: 'Sports & Fitness', icon: 'dumbbell', color: '#059669', order: 6 },
  { name: 'Services', icon: 'briefcase', color: '#2563eb', order: 7 },
  { name: 'Food & Drinks', icon: 'coffee', color: '#c026d3', order: 8 },
  { name: 'Free Stuff', icon: 'gift', color: '#64748b', order: 9 },
]

const universities = [
  { name: 'University of Cape Town', shortName: 'UCT', province: 'Western Cape', campuses: '["Upper Campus","Hiddingh Campus","Health Sciences Campus"]' },
  { name: 'University of the Witwatersrand', shortName: 'Wits', province: 'Gauteng', campuses: '["East Campus","West Campus","Braamfontein"]' },
  { name: 'Stellenbosch University', shortName: 'SU', province: 'Western Cape', campuses: '["Stellenbosch Main","Tygerberg","Bellville"]' },
  { name: 'University of Pretoria', shortName: 'UP', province: 'Gauteng', campuses: '["Hatfield","Groenkloof","Prinshof"]' },
  { name: 'University of KwaZulu-Natal', shortName: 'UKZN', province: 'KwaZulu-Natal', campuses: '["Westville","Howard College","Pietermaritzburg","Edgewood"]' },
  { name: 'University of Johannesburg', shortName: 'UJ', province: 'Gauteng', campuses: '["Auckland Park","Bunting Road","Doornfontein","Soweto"]' },
  { name: 'Rhodes University', shortName: 'RU', province: 'Eastern Cape', campuses: '["Grahamstown Main"]' },
  { name: 'North-West University', shortName: 'NWU', province: 'North West', campuses: '["Potchefstroom","Vaal Triangle","Mafikeng"]' },
  { name: 'University of the Free State', shortName: 'UFS', province: 'Free State', campuses: '["Bloemfontein","Qwaqwa","South Campus"]' },
  { name: 'University of Limpopo', shortName: 'UL', province: 'Limpopo', campuses: '["Turfloop","Medical Sciences"]' },
]

const users = [
  { id: 'user-1', name: 'Sipho Mkhize', email: 'sipho@uct.ac.za', phone: '+27 71 234 5678', university: 'University of Cape Town', campus: 'Upper Campus', bio: '3rd year Computer Science student. Love coding and gaming.', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sipho' },
  { id: 'user-2', name: 'Thandi Ndlovu', email: 'thandi@wits.ac.za', phone: '+27 82 345 6789', university: 'University of the Witwatersrand', campus: 'East Campus', bio: 'Med student looking to sell my pre-med textbooks.', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Thandi' },
  { id: 'user-3', name: 'Kgosi Molefe', email: 'kgosi@su.ac.za', phone: '+27 63 456 7890', university: 'Stellenbosch University', campus: 'Stellenbosch Main', bio: 'Engineering student. Got too many gadgets, need to declutter.', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Kgosi' },
  { id: 'user-4', name: 'Lerato Mahlangu', email: 'lerato@up.ac.za', phone: '+27 74 567 8901', university: 'University of Pretoria', campus: 'Hatfield', bio: 'BA Communication student. Fashion enthusiast.', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Lerato' },
  { id: 'user-5', name: 'Bongani Dlamini', email: 'bongani@ukzn.ac.za', phone: '+27 85 678 9012', university: 'University of KwaZulu-Natal', campus: 'Westville', bio: 'BCom Accounting. Selling stuff I no longer need.', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bongani' },
  { id: 'user-6', name: 'Nomsa Zulu', email: 'nomsa@uj.ac.za', phone: '+27 76 789 0123', university: 'University of Johannesburg', campus: 'Auckland Park', bio: 'Law student. Moving out, selling everything!', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Nomsa' },
  { id: 'user-7', name: 'Andile Botha', email: 'andile@ru.ac.za', phone: '+27 72 890 1234', university: 'Rhodes University', campus: 'Grahamstown Main', bio: 'Journalism & Media Studies. Got loads of textbooks to sell.', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Andile' },
  { id: 'user-8', name: 'Zanele Nkosi', email: 'zanele@nwu.ac.za', phone: '+27 68 901 2345', university: 'North-West University', campus: 'Potchefstroom', bio: 'Education student. Love finding good deals.', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Zanele' },
]

const placeholderImages = [
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1580910051074-3eb694886571?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
]

const textbookImages = [
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=400&fit=crop',
]

const electronicsImages = [
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519558260268-cde7e03a0152?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
]

const furnitureImages = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=400&h=400&fit=crop',
]

const clothingImages = [
  'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
]

const transportImages = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop',
]

const listings = [
  // Textbooks
  { title: 'Calculus: Early Transcendentals 8th Edition', description: 'James Stewart Calculus textbook. Used for one semester, still in excellent condition. Minimal highlighting. Perfect for Maths 1A/1B.', price: 450, categoryId: 'cat-1', sellerId: 'user-1', universityId: 'uni-1', campus: 'Upper Campus', location: 'UCT, Rondebosch', condition: 'Like New', images: JSON.stringify([textbookImages[0]]) },
  { title: 'Organic Chemistry - Klein 3rd Ed', description: 'Organic Chemistry textbook by David Klein. Great condition, no torn pages. Comes with the solution manual.', price: 550, categoryId: 'cat-1', sellerId: 'user-2', universityId: 'uni-2', campus: 'East Campus', location: 'Wits, Braamfontein', condition: 'Good', images: JSON.stringify([textbookImages[1]]) },
  { title: 'Introduction to Psychology - MyPsychLab', description: 'Complete Psych 101 textbook set. Includes access code for online resources (still valid). Barely used.', price: 380, categoryId: 'cat-1', sellerId: 'user-4', universityId: 'uni-4', campus: 'Hatfield', location: 'UP, Hatfield', condition: 'Like New', images: JSON.stringify([textbookImages[2]]) },
  { title: 'Financial Accounting - Volume 1 & 2 Bundle', description: 'Complete set for Accounting 101-102. Both volumes included. Some pencil notes in margins but overall clean.', price: 600, categoryId: 'cat-1', sellerId: 'user-5', universityId: 'uni-5', campus: 'Westville', location: 'UKZN, Westville', condition: 'Good', images: JSON.stringify([textbookImages[3]]) },
  { title: 'Business Management 101 Notes Pack', description: 'Comprehensive study notes for Business Management 101. A+ student notes with summaries, past paper solutions and mind maps.', price: 150, categoryId: 'cat-1', sellerId: 'user-3', universityId: 'uni-3', campus: 'Stellenbosch Main', location: 'SU, Stellenbosch', condition: 'New', images: JSON.stringify([textbookImages[0]]) },
  { title: 'Human Anatomy & Physiology Atlas', description: 'Marieb Human Anatomy & Physiology 10th edition. Includes CD. Great for medical and health sciences students.', price: 700, categoryId: 'cat-1', sellerId: 'user-2', universityId: 'uni-2', campus: 'East Campus', location: 'Wits, Braamfontein', condition: 'Good', images: JSON.stringify([textbookImages[2]]) },

  // Electronics
  { title: 'iPad Air 5th Gen 64GB - Space Grey', description: 'Selling my iPad as I upgraded. Excellent condition, always had a screen protector and case. Battery health 95%. Comes with charger and original box.', price: 6500, categoryId: 'cat-2', sellerId: 'user-1', universityId: 'uni-1', campus: 'Upper Campus', location: 'UCT, Rondebosch', condition: 'Like New', images: JSON.stringify([electronicsImages[0]]) },
  { title: 'Samsung Galaxy Buds2 Pro', description: 'Noise-cancelling earbuds. Used for 3 months. Excellent sound quality. Comes with all original accessories and case.', price: 1800, categoryId: 'cat-2', sellerId: 'user-3', universityId: 'uni-3', campus: 'Stellenbosch Main', location: 'SU, Stellenbosch', condition: 'Like New', images: JSON.stringify([electronicsImages[1]]) },
  { title: 'HP Laptop 15s - Ryzen 5, 8GB RAM', description: 'Great laptop for studies. Ryzen 5 5500U, 8GB RAM, 256GB SSD. Windows 11. Battery lasts about 5 hours. Minor scratches on lid.', price: 5500, categoryId: 'cat-2', sellerId: 'user-5', universityId: 'uni-5', campus: 'Westville', location: 'UKZN, Westville', condition: 'Good', images: JSON.stringify([electronicsImages[2]]) },
  { title: 'Canon EOS 250D DSLR Camera', description: 'Perfect for photography students or hobbyists. 24.1MP, comes with 18-55mm kit lens, camera bag, and 64GB SD card. Shutter count under 5000.', price: 4800, categoryId: 'cat-2', sellerId: 'user-7', universityId: 'uni-7', campus: 'Grahamstown Main', location: 'Rhodes, Makhanda', condition: 'Like New', images: JSON.stringify([electronicsImages[3]]) },
  { title: 'JBL Flip 6 Bluetooth Speaker', description: 'Portable Bluetooth speaker. Waterproof, great sound. Used for about 6 months. Minor cosmetic wear.', price: 1200, categoryId: 'cat-2', sellerId: 'user-4', universityId: 'uni-4', campus: 'Hatfield', location: 'UP, Hatfield', condition: 'Good', images: JSON.stringify([electronicsImages[0]]) },
  { title: 'Scientific Calculator Casio FX-991EX', description: 'ClassWiz scientific calculator. Required for most engineering and science courses. Barely used, like new.', price: 280, categoryId: 'cat-2', sellerId: 'user-8', universityId: 'uni-8', campus: 'Potchefstroom', location: 'NWU, Potchefstroom', condition: 'Like New', images: JSON.stringify([electronicsImages[1]]) },

  // Accommodation
  { title: 'Room in Shared House - Obs, Cape Town', description: 'Furnished room available in a 4-bedroom shared house in Observatory. Close to UCT (5 min drive). Includes WiFi, electricity, water. Shared kitchen and bathroom. R4000/month, available 1 July.', price: 4000, categoryId: 'cat-3', sellerId: 'user-1', universityId: 'uni-1', campus: 'Upper Campus', location: 'Observatory, Cape Town', condition: 'Good', images: JSON.stringify([placeholderImages[0]]) },
  { title: 'Student Apartment - Braamfontein', description: 'Modern studio apartment in Braamfontein. Walking distance to Wits. Fully furnished with built-in desk, wardrobe, and kitchenette. Gym and laundry in building. R5500/month.', price: 5500, categoryId: 'cat-3', sellerId: 'user-6', universityId: 'uni-6', campus: 'Auckland Park', location: 'Braamfontein, Johannesburg', condition: 'New', images: JSON.stringify([placeholderImages[1]]) },
  { title: 'Subletting Room - Hatfield, Pretoria', description: 'Subletting my room for semester break (June-Aug). Sharing with 2 friendly UP students. Close to campus, shops, and Gautrain. Fully furnished.', price: 3000, categoryId: 'cat-3', sellerId: 'user-4', universityId: 'uni-4', campus: 'Hatfield', location: 'Hatfield, Pretoria', condition: 'Good', images: JSON.stringify([placeholderImages[2]]) },

  // Clothing
  { title: 'Varsity Jacket - UCT Limited Edition', description: 'UCT branded varsity jacket. Size M. Only worn once. Selling because I got the wrong size. These retail for R1200.', price: 650, categoryId: 'cat-4', sellerId: 'user-1', universityId: 'uni-1', campus: 'Upper Campus', location: 'UCT, Rondebosch', condition: 'Like New', images: JSON.stringify([clothingImages[0]]) },
  { title: 'Nike Air Force 1 - White, Size 9', description: 'Classic white AF1s. Size 9 UK. Worn a few times, still very clean. No creases. Comes with original box.', price: 1200, categoryId: 'cat-4', sellerId: 'user-4', universityId: 'uni-4', campus: 'Hatfield', location: 'UP, Hatfield', condition: 'Good', images: JSON.stringify([clothingImages[1]]) },
  { title: 'Graduation Gown & Hood - BCom', description: 'UCT graduation gown and BCom hood. Used once. Also selling the trencher (mortar board). Save yourself the rental fee!', price: 800, categoryId: 'cat-4', sellerId: 'user-5', universityId: 'uni-5', campus: 'Westville', location: 'UKZN, Westville', condition: 'Like New', images: JSON.stringify([clothingImages[2]]) },

  // Transport
  { title: 'Lift Club - Johannesburg to Pretoria Daily', description: 'Offering daily lift from Johannesburg CBD to UP Hatfield campus. Mon-Fri, 7am departure, 5pm return. R1500/month or R100/ride.', price: 1500, categoryId: 'cat-5', sellerId: 'user-6', universityId: 'uni-6', campus: 'Auckland Park', location: 'Johannesburg CBD', condition: 'New', images: JSON.stringify([transportImages[0]]) },
  { title: 'Mountain Bike - Giant ATX 2', description: 'Great commuter bike for campus. 21-speed Shimano gears, front suspension. Recently serviced. Lock and helmet included.', price: 2500, categoryId: 'cat-5', sellerId: 'user-3', universityId: 'uni-3', campus: 'Stellenbosch Main', location: 'SU, Stellenbosch', condition: 'Good', images: JSON.stringify([transportImages[1]]) },

  // Furniture
  { title: 'Study Desk & Chair Set', description: 'Solid wood study desk (120x60cm) with ergonomic office chair. Both in good condition. Selling because I am moving out of res.', price: 1500, categoryId: 'cat-6', sellerId: 'user-7', universityId: 'uni-7', campus: 'Grahamstown Main', location: 'Rhodes, Makhanda', condition: 'Good', images: JSON.stringify([furnitureImages[0]]) },
  { title: 'Single Bed Base + Mattress', description: 'Standard single bed base with orthopaedic mattress. Clean, no stains. Mattress has been in a waterproof cover the whole time. Must collect.', price: 1200, categoryId: 'cat-6', sellerId: 'user-6', universityId: 'uni-6', campus: 'Auckland Park', location: 'Auckland Park, JHB', condition: 'Good', images: JSON.stringify([furnitureImages[1]]) },
  { title: 'Mini Fridge - Defy 130L', description: 'Small bar fridge, perfect for res room. 130L capacity, freezer compartment. Works perfectly. About 2 years old.', price: 1800, categoryId: 'cat-6', sellerId: 'user-8', universityId: 'uni-8', campus: 'Potchefstroom', location: 'NWU, Potchefstroom', condition: 'Good', images: JSON.stringify([furnitureImages[2]]) },

  // Services
  { title: 'Tutoring - Maths 1A & 1B', description: '3rd year Maths major offering tutoring for first-year Maths courses. R200/hour, one-on-one or small groups. Online or in-person at UCT Jammie Shuttle route.', price: 200, categoryId: 'cat-8', sellerId: 'user-1', universityId: 'uni-1', campus: 'Upper Campus', location: 'UCT, Rondebosch', condition: 'New', images: JSON.stringify([placeholderImages[3]]) },
  { title: 'Proofreading & Essay Editing', description: 'MA English student offering proofreading and editing services. R50 per 1000 words. Quick turnaround. Specialising in Humanities essays.', price: 50, categoryId: 'cat-8', sellerId: 'user-7', universityId: 'uni-7', campus: 'Grahamstown Main', location: 'Rhodes, Makhanda', condition: 'New', images: JSON.stringify([placeholderImages[4]]) },

  // Free Stuff
  { title: 'Free Textbooks - 1st Year BCom', description: 'Giving away my 1st year BCom textbooks. Titles: Economics 101, Business Stats, Accounting Principles. Must collect from Hatfield.', price: 0, categoryId: 'cat-10', sellerId: 'user-4', universityId: 'uni-4', campus: 'Hatfield', location: 'UP, Hatfield', condition: 'Good', images: JSON.stringify([textbookImages[3]]) },
  { title: 'Free Desk Lamp & Stationery Set', description: 'Clearing out my room. Giving away a desk lamp (still works perfectly), set of pens, highlighters, and notebooks.', price: 0, categoryId: 'cat-10', sellerId: 'user-8', universityId: 'uni-8', campus: 'Potchefstroom', location: 'NWU, Potchefstroom', condition: 'Good', images: JSON.stringify([placeholderImages[5]]) },
]

const messages = [
  { content: 'Hi! Is the textbook still available?', listingId: 'list-1', senderId: 'user-2', receiverId: 'user-1' },
  { content: 'Yes, still available! When can you collect?', listingId: 'list-1', senderId: 'user-1', receiverId: 'user-2' },
  { content: 'Can you do R400 for the calculator?', listingId: 'list-12', senderId: 'user-3', receiverId: 'user-8' },
  { content: 'What condition is the bed in?', listingId: 'list-19', senderId: 'user-5', receiverId: 'user-6' },
]

async function seed() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await db.message.deleteMany()
  await db.listing.deleteMany()
  await db.user.deleteMany()
  await db.category.deleteMany()
  await db.university.deleteMany()

  // Create categories
  for (const cat of categories) {
    await db.category.create({ data: { id: `cat-${cat.order + 1}`, ...cat } })
  }
  console.log(`✅ Created ${categories.length} categories`)

  // Create universities
  for (const uni of universities) {
    await db.university.create({ data: { id: `uni-${universities.indexOf(uni) + 1}`, ...uni } })
  }
  console.log(`✅ Created ${universities.length} universities`)

  // Create users
  for (const user of users) {
    await db.user.create({ data: user as any })
  }
  console.log(`✅ Created ${users.length} users`)

  // Create listings
  for (const listing of listings) {
    await db.listing.create({
      data: {
        id: `list-${listings.indexOf(listing) + 1}`,
        ...listing,
        negotiable: listing.price > 0,
      } as any,
    })
  }
  console.log(`✅ Created ${listings.length} listings`)

  // Create messages
  for (const msg of messages) {
    await db.message.create({ data: msg as any })
  }
  console.log(`✅ Created ${messages.length} messages`)

  console.log('\n🎉 Database seeded successfully!')
}

seed()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
