<?php
/**
 * Template Name: Nuestra Carta
 *
 * Muestra el menú completo agrupado por categoría con filtros Bootstrap.
 * Cada platillo muestra nombre, descripción, precio y tiempo de preparación.
 *
 * @package Rustica_Theme
 * @since   1.0.0
 */
get_header();

$categorias = get_terms(['taxonomy' => 'product_cat', 'hide_empty' => true, 'orderby' => 'name']);
$cat_activa = sanitize_text_field($_GET['categoria'] ?? 'todas');
?>

<div style="background:#1a1a1a;padding:80px 0 40px;text-align:center;">
    <p style="color:#c9a84c;text-transform:uppercase;letter-spacing:.2em;font-size:.8rem;margin-bottom:8px;">Gastronomía de autor</p>
    <h1 style="font-family:'Playfair Display',serif;color:#fff;font-size:2.8rem;margin-bottom:16px;">Nuestra Carta</h1>
    <p style="color:#aaa;max-width:500px;margin:0 auto;">Ingredientes de temporada, técnica contemporánea, sabores que perduran.</p>
</div>

<!-- Filtros de categoría -->
<div style="background:#111;padding:16px 0;position:sticky;top:0;z-index:100;border-bottom:1px solid #222;">
    <div class="container">
        <div class="d-flex gap-2 flex-wrap justify-content-center">
            <a href="?categoria=todas" class="btn btn-sm <?php echo $cat_activa === 'todas' ? 'btn-rustica' : 'btn-outline-secondary'; ?>"
               style="<?php echo $cat_activa === 'todas' ? 'background:#c9a84c;border-color:#c9a84c;color:#1a1a1a;font-weight:700;' : 'border-color:#555;color:#aaa;'; ?>">
                Todos
            </a>
            <?php foreach ($categorias as $cat) : ?>
            <a href="?categoria=<?php echo esc_attr($cat->slug); ?>"
               class="btn btn-sm"
               style="<?php echo $cat_activa === $cat->slug ? 'background:#c9a84c;border-color:#c9a84c;color:#1a1a1a;font-weight:700;' : 'border:1px solid #555;color:#aaa;background:transparent;'; ?>">
                <?php echo esc_html($cat->name); ?>
            </a>
            <?php endforeach; ?>
        </div>
    </div>
</div>

<main style="background:#0f0f0f;min-height:60vh;padding:48px 0;">
    <div class="container">
        <?php foreach ($categorias as $cat) :
            if ($cat_activa !== 'todas' && $cat_activa !== $cat->slug) continue;

            $productos = wc_get_products([
                'category' => [$cat->slug],
                'status'   => 'publish',
                'limit'    => -1,
            ]);
            if (empty($productos)) continue;
        ?>
        <div class="mb-5">
            <h2 style="font-family:'Playfair Display',serif;color:#c9a84c;font-size:1.8rem;margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid #222;">
                <?php echo esc_html($cat->name); ?>
            </h2>
            <div class="row g-3">
                <?php foreach ($productos as $p) :
                    $tiempo = get_post_meta($p->get_id(), 'tiempo_prep_min', true);
                    $img    = $p->get_image_id() ? wp_get_attachment_image_url($p->get_image_id(), 'rustica-card') : null;
                ?>
                <div class="col-md-6 col-lg-4">
                    <div style="background:#1a1a1a;border-radius:12px;overflow:hidden;height:100%;display:flex;flex-direction:column;border:1px solid #222;transition:border-color .2s;"
                         onmouseenter="this.style.borderColor='rgba(201,168,76,.4)'"
                         onmouseleave="this.style.borderColor='#222'">
                        <?php if ($img) : ?>
                        <img src="<?php echo esc_url($img); ?>"
                             alt="<?php echo esc_attr($p->get_name()); ?>"
                             style="width:100%;height:180px;object-fit:cover;">
                        <?php endif; ?>
                        <div style="padding:20px;flex:1;display:flex;flex-direction:column;">
                            <h5 style="color:#f5f0e8;font-family:'Playfair Display',serif;font-size:1.05rem;margin-bottom:8px;">
                                <?php echo esc_html($p->get_name()); ?>
                            </h5>
                            <p style="color:#888;font-size:13px;line-height:1.5;flex:1;margin-bottom:16px;">
                                <?php echo esc_html($p->get_short_description()); ?>
                            </p>
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <strong style="color:#c9a84c;font-size:1.2rem;">
                                    $<?php echo number_format((float)$p->get_price(), 0, ',', '.'); ?>
                                </strong>
                                <?php if ($tiempo) : ?>
                                <span style="font-size:12px;color:#666;background:#222;padding:3px 10px;border-radius:20px;">
                                    <?php echo esc_html($tiempo); ?> min
                                </span>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</main>

<?php get_footer(); ?>
