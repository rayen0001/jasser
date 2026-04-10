import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { Products } from 'src/app/services/products';
import { CreateProductPayload, Product, UpdateProductPayload } from 'src/app/models/products.models';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule],
})
export class ProductsPage implements OnInit {
  products: Product[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  showFormModal = false;

  searchTerm = '';
  categoryFilter = 'all';
  sortBy = 'newest';

  isEditMode = false;
  editingProductId = '';
  editingProductRef = '';

  productForm = {
    name: '',
    desc: '',
    price: 0,
    category: '',
    stock: 0,
    remisEnabled: false,
    remisPercentage: 0,
  };

  thumbnailFile: File | null = null;
  imageFiles: File[] = [];

  readonly sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'price-asc', label: 'Price Low-High' },
    { value: 'price-desc', label: 'Price High-Low' },
    { value: 'stock-desc', label: 'Stock High-Low' },
  ];

  readonly productCategories = ['Electronics', 'Clothing', 'Food', 'Books', 'Other'];

  constructor(private productsService: Products) {}

  ngOnInit() {
    this.loadProducts();
  }

  get filteredProducts(): Product[] {
    const query = this.searchTerm.trim().toLowerCase();

    let list = this.products.filter((p) => {
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.ref.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query);

      const matchesCategory = this.categoryFilter === 'all' || p.category === this.categoryFilter;
      return matchesQuery && matchesCategory;
    });

    list = [...list].sort((a, b) => {
      switch (this.sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'stock-desc':
          return b.stock - a.stock;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return list;
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productsService.getAll().subscribe({
      next: (res) => {
        this.products = res.products;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load products.';
        this.isLoading = false;
      },
    });
  }

  onThumbnailChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.thumbnailFile = input.files?.[0] || null;
  }

  onImagesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imageFiles = input.files ? Array.from(input.files) : [];
  }

submitProduct(): void {
    if (!this.productForm.name || !this.productForm.desc || !this.productForm.category) {
      this.errorMessage = 'Name, description, and category are required.';
      return;
    }

    if (!this.productCategories.includes(this.productForm.category)) {
      this.errorMessage = 'Category must be one of: Electronics, Clothing, Food, Books, Other.';
      return;
    }

    if (this.productForm.price < 0 || this.productForm.stock < 0) {
      this.errorMessage = 'Price and stock must be non-negative.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    const ref = this.isEditMode
      ? this.editingProductRef || this.buildAutoRef(this.productForm.name)
      : this.buildAutoRef(this.productForm.name);

    const basePayload = {
      name: this.productForm.name,
      ref,
      desc: this.productForm.desc,
      price: this.productForm.price,
      category: this.productForm.category,
      stock: this.productForm.stock,
      remisComposerd: {
        enabled: this.productForm.remisEnabled,
        percentage: this.productForm.remisEnabled ? this.productForm.remisPercentage : 0,
      },
      ...(this.thumbnailFile ? { thumbnail: this.thumbnailFile } : {}),
      ...(this.imageFiles.length ? { images: this.imageFiles } : {}),
    };

    console.log('[submitProduct] mode:', this.isEditMode ? 'UPDATE' : 'CREATE', '| payload:', basePayload);

    if (this.isEditMode && this.editingProductId) {
      const existing = this.products.find((p) => p._id === this.editingProductId);
      const updatePayload: UpdateProductPayload = {
        ...basePayload,
        existingImages: existing?.images || [],
      };

      console.log('[submitProduct] update payload:', updatePayload);

      this.productsService.update(this.editingProductId, updatePayload).subscribe({
        next: () => this.afterSaveSuccess('Product updated successfully.'),
        error: () => this.afterSaveError('Failed to update product.'),
      });
      return;
    }

    const createPayload: CreateProductPayload = basePayload;

    console.log('[submitProduct] create payload:', createPayload);

    this.productsService.create(createPayload).subscribe({
      next: () => this.afterSaveSuccess('Product created successfully.'),
      error: () => this.afterSaveError('Failed to create product.'),
    });
  }

  startEdit(product: Product): void {
    this.isEditMode = true;
    this.editingProductId = product._id;
    this.editingProductRef = product.ref;
    this.showFormModal = true;
    this.productForm = {
      name: product.name,
      desc: product.desc,
      price: product.price,
      category: this.productCategories.includes(product.category) ? product.category : 'Other',
      stock: product.stock,
      remisEnabled: product.remisComposerd?.enabled || false,
      remisPercentage: product.remisComposerd?.percentage || 0,
    };
    this.thumbnailFile = null;
    this.imageFiles = [];
  }

  cancelEdit(): void {
    this.closeFormModal();
  }

  openCreateModal(): void {
    this.resetForm();
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.resetForm();
  }

  buildAutoRef(name: string): string {
    const base = (name || 'product')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 18);
    const stamp = Date.now().toString().slice(-6);
    return `PRD-${base || 'ITEM'}-${stamp}`;
  }

  deleteProduct(product: Product): void {
    const approved = window.confirm(`Delete ${product.name}?`);
    if (!approved) {
      return;
    }

    this.productsService.remove(product._id).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p._id !== product._id);
      },
      error: () => {
        this.errorMessage = 'Failed to delete product.';
      },
    });
  }

  private afterSaveSuccess(_: string): void {
    this.isSaving = false;
    this.loadProducts();
    this.closeFormModal();
  }

  private afterSaveError(message: string): void {
    this.isSaving = false;
    this.errorMessage = message;
  }

  private resetForm(): void {
    this.isEditMode = false;
    this.editingProductId = '';
    this.editingProductRef = '';
    this.productForm = {
      name: '',
      desc: '',
      price: 0,
      category: 'Electronics',
      stock: 0,
      remisEnabled: false,
      remisPercentage: 0,
    };
    this.thumbnailFile = null;
    this.imageFiles = [];
  }

}
